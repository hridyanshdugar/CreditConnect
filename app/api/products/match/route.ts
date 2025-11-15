import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, needs, preferences } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user's current risk profile
    const riskProfile = db.prepare(`
      SELECT helix_score, flags FROM risk_profiles
      WHERE user_id = ?
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as any;

    if (!riskProfile) {
      return NextResponse.json(
        { error: 'Risk profile not found. Please calculate risk first.' },
        { status: 404 }
      );
    }

    const helixScore = riskProfile.helix_score;
    const flags = JSON.parse(riskProfile.flags || '{}');

    // Get all active products
    const products = db.prepare(`
      SELECT p.*, bp.bank_name
      FROM products p
      JOIN bank_profiles bp ON p.bank_id = bp.id
      WHERE p.is_active = 1
    `).all() as any[];

    const matches = products
      .map((product) => {
        // Check eligibility
        const eligible =
          (!product.min_helix_score || helixScore >= product.min_helix_score) &&
          (!product.max_helix_score || helixScore <= product.max_helix_score);

        if (!eligible) {
          return null;
        }

        // Calculate match score (0-1)
        let matchScore = 0.5; // Base score

        // Risk-based adjustment
        const riskAdjustment = (100 - helixScore) / 100; // Lower risk = higher adjustment
        matchScore += riskAdjustment * 0.3;

        // Product type matching (if needs specified)
        if (needs?.productType && needs.productType === product.product_type) {
          matchScore += 0.2;
        }

        // Amount matching
        if (needs?.amount) {
          const amountMatch =
            needs.amount >= product.min_loan_amount &&
            needs.amount <= product.max_loan_amount;
          if (amountMatch) matchScore += 0.2;
        }

        // Term matching
        if (needs?.termMonths) {
          const termMatch =
            needs.termMonths >= product.min_term_months &&
            needs.termMonths <= product.max_term_months;
          if (termMatch) matchScore += 0.1;
        }

        matchScore = Math.min(1.0, matchScore);

        // Calculate personalized pricing
        const pricing = calculatePricing(helixScore, product);

        return {
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
            productType: product.product_type,
            bankName: product.bank_name,
            minLoanAmount: product.min_loan_amount,
            maxLoanAmount: product.max_loan_amount,
            minTermMonths: product.min_term_months,
            maxTermMonths: product.max_term_months,
          },
          matchScore: Math.round(matchScore * 100) / 100,
          preApproved: matchScore > 0.8,
          instantApproval: flags.fastTrackEligible && matchScore > 0.7,
          pricing: pricing,
        };
      })
      .filter((match) => match !== null)
      .sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0));

    return NextResponse.json({
      matches,
      helixScore,
      totalMatches: matches.length,
    });
  } catch (error: any) {
    console.error('Product matching error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to match products' },
      { status: 500 }
    );
  }
}

function calculatePricing(helixScore: number, product: any) {
  // Risk-based pricing adjustment (based on grade ranges)
  let rateAdjustment = 0;
  let feeMultiplier = 1.0;
  let amountMultiplier = 1.0;

  if (helixScore <= 20) {
    // Grade A
    rateAdjustment = -2.0; // 2% discount
    feeMultiplier = 0.8;
    amountMultiplier = 1.2;
  } else if (helixScore <= 40) {
    // Grade B
    rateAdjustment = 0;
    feeMultiplier = 1.0;
    amountMultiplier = 1.0;
  } else if (helixScore <= 60) {
    // Grade C
    rateAdjustment = 3.0;
    feeMultiplier = 1.2;
    amountMultiplier = 0.8;
  } else if (helixScore <= 80) {
    // Grade D
    rateAdjustment = 6.0;
    feeMultiplier = 1.5;
    amountMultiplier = 0.6;
  } else if (helixScore <= 90) {
    // Grade E
    rateAdjustment = 8.0;
    feeMultiplier = 1.8;
    amountMultiplier = 0.5;
  } else {
    // Grade F (shouldn't reach here due to eligibility check)
    rateAdjustment = 10.0;
    feeMultiplier = 2.0;
    amountMultiplier = 0.5;
  }

  return {
    interestRate: Math.max(0, product.base_interest_rate + rateAdjustment),
    originationFee: product.base_origination_fee
      ? product.base_origination_fee * feeMultiplier
      : 0,
    maxAmount: product.max_loan_amount * amountMultiplier,
    terms: getAvailableTerms(helixScore, product),
  };
}

function getAvailableTerms(helixScore: number, product: any): number[] {
  const terms: number[] = [];
  const minTerm = product.min_term_months;
  const maxTerm = product.max_term_months;

  // Grade A and B customers get more flexible terms
  if (helixScore <= 20) {
    // Grade A - most flexible
    for (let i = minTerm; i <= maxTerm; i += 6) {
      terms.push(i);
    }
  } else if (helixScore <= 40) {
    // Grade B - flexible
    for (let i = minTerm; i <= maxTerm; i += 12) {
      terms.push(i);
    }
  } else {
    // Limited terms for higher risk (Grade C, D, E, F)
    terms.push(minTerm);
    if (maxTerm > minTerm) {
      terms.push(Math.floor((minTerm + maxTerm) / 2));
    }
  }

  return terms;
}

