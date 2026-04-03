import { NextResponse } from 'next/server';

interface CPSCRecall {
  RecallID: number;
  RecallNumber: string;
  RecallDate: string;
  Description: string;
  Title: string;
  URL: string;
  ConsumerContact: string;
  Products: Array<{
    Name: string;
    Type: string;
    CategoryID: string;
    NumberOfUnits: string;
    Description: string;
    Model: string;
  }>;
  Hazards: Array<{
    Name: string;
    HazardType: string;
    HazardTypeID: string;
  }>;
  Manufacturers: Array<{
    Name: string;
    CompanyID: string;
  }>;
  Remedies: Array<{
    Name: string;
  }>;
  Injuries: Array<{
    Name: string;
  }>;
  Images: Array<{
    URL: string;
  }>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const brand = searchParams.get('brand') || '';

  if (!query && !brand) {
    return NextResponse.json(
      { error: 'A search query or brand is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch from CPSC SaferProducts API
    const cpscUrl = new URL('https://www.saferproducts.gov/RestWebServices/Recall');
    cpscUrl.searchParams.set('format', 'json');
    // Only fetch recent recalls (last 5 years)
    cpscUrl.searchParams.set('RecallDateStart', '2021');

    const response = await fetch(cpscUrl.toString(), {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 86400 }, // cache for 24 hours
    });

    if (!response.ok) {
      throw new Error(`CPSC API returned ${response.status}`);
    }

    const allRecalls: CPSCRecall[] = await response.json();

    // Filter recalls matching the query and/or brand
    const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const brandLower = brand.toLowerCase();

    const matches = allRecalls.filter((recall) => {
      const titleLower = recall.Title?.toLowerCase() || '';
      const descLower = recall.Description?.toLowerCase() || '';
      const productNames = recall.Products?.map(p => p.Name?.toLowerCase() || '').join(' ') || '';
      const productDescs = recall.Products?.map(p => p.Description?.toLowerCase() || '').join(' ') || '';
      const manufacturerNames = recall.Manufacturers?.map(m => m.Name?.toLowerCase() || '').join(' ') || '';
      const combined = `${titleLower} ${descLower} ${productNames} ${productDescs} ${manufacturerNames}`;

      // Brand must match if provided
      if (brandLower && !manufacturerNames.includes(brandLower) && !combined.includes(brandLower)) {
        return false;
      }

      // At least one search term must match
      if (searchTerms.length > 0) {
        return searchTerms.some(term => combined.includes(term));
      }

      return true;
    });

    // Return top 10 most recent
    const results = matches.slice(0, 10).map((recall) => ({
      recallId: recall.RecallNumber,
      date: recall.RecallDate,
      title: recall.Title,
      description: recall.Description,
      url: recall.URL,
      products: recall.Products?.map(p => ({
        name: p.Name,
        model: p.Model,
        units: p.NumberOfUnits,
        description: p.Description,
      })) || [],
      hazards: recall.Hazards?.map(h => h.Name) || [],
      manufacturers: recall.Manufacturers?.map(m => m.Name) || [],
      remedies: recall.Remedies?.map(r => r.Name) || [],
      injuries: recall.Injuries?.map(i => i.Name) || [],
      imageUrl: recall.Images?.[0]?.URL || null,
      consumerContact: recall.ConsumerContact,
    }));

    return NextResponse.json({
      results,
      total: matches.length,
      query,
      brand,
    });
  } catch (error) {
    console.error('CPSC recall API error:', error);
    return NextResponse.json(
      { error: 'Failed to check recalls. Please try again.' },
      { status: 500 }
    );
  }
}
