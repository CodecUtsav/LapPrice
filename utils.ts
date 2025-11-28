
import { Laptop, AggregatedData } from './types';

// Helper to clean numeric strings (e.g., "1.37kg" -> 1.37, "₹50,000" -> 50000)
const cleanNumber = (val: string): number => {
  if (!val) return 0;
  // Remove non-numeric chars except dot and minus, then parse
  const clean = val.replace(/[^0-9.-]+/g, '');
  return parseFloat(clean) || 0;
};

export const parseCSV = (csvText: string): Laptop[] => {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // 1. Parse Header to find indices dynamically
  // We use the regex to handle quoted headers if present
  const headerRow = lines[0].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  
  // Map required fields to their column index
  const map: Record<string, number> = {
    company: headerRow.findIndex(h => h.includes('company')),
    typeName: headerRow.findIndex(h => h.includes('typename') || h.includes('type')),
    inches: headerRow.findIndex(h => h.includes('inches')),
    screenResolution: headerRow.findIndex(h => h.includes('screenresolution') || h.includes('screen')),
    cpu: headerRow.findIndex(h => h.includes('cpu')),
    ram: headerRow.findIndex(h => h.includes('ram')),
    memory: headerRow.findIndex(h => h.includes('memory') || h.includes('storage')),
    gpu: headerRow.findIndex(h => h.includes('gpu')),
    opSys: headerRow.findIndex(h => h.includes('opsys') || h.includes('os')),
    weight: headerRow.findIndex(h => h.includes('weight')),
    price: headerRow.findIndex(h => h.includes('price'))
  };

  // Validate that critical columns exist
  if (map.price === -1 || map.company === -1) {
    console.error("CSV Parse Error: Could not find 'Price' or 'Company' columns in header.", headerRow);
    return [];
  }

  const laptops: Laptop[] = [];

  // 2. Parse Data Rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split by comma, ignoring commas inside quotes
    const row = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, '').trim());

    try {
      const laptop: Laptop = {
        id: i,
        company: row[map.company] || 'Unknown',
        typeName: row[map.typeName] || 'Unknown',
        inches: parseFloat(row[map.inches] || '0'),
        screenResolution: row[map.screenResolution] || '',
        cpu: row[map.cpu] || '',
        ram: cleanNumber(row[map.ram]), // Auto-strips 'GB'
        memory: row[map.memory] || '',
        gpu: row[map.gpu] || '',
        opSys: row[map.opSys] || '',
        weight: cleanNumber(row[map.weight]), // Auto-strips 'kg'
        price: cleanNumber(row[map.price])
      };

      // Sanity check: Price must be positive
      if (laptop.price > 0) {
        laptops.push(laptop);
      }
    } catch (e) {
      console.warn(`Failed to parse row ${i}`, row);
    }
  }

  console.log(`Parsed ${laptops.length} laptops successfully.`);
  return laptops;
};

export const formatCurrency = (value: number) => {
  if (isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const getAveragePriceByCompany = (data: Laptop[]): AggregatedData[] => {
  if (!data || data.length === 0) return [];

  const companyTotals: Record<string, { sum: number; count: number }> = {};
  
  data.forEach(l => {
    if (!companyTotals[l.company]) {
      companyTotals[l.company] = { sum: 0, count: 0 };
    }
    companyTotals[l.company].sum += l.price;
    companyTotals[l.company].count += 1;
  });

  return Object.keys(companyTotals).map(company => ({
    label: company,
    value: Math.round(companyTotals[company].sum / companyTotals[company].count),
    count: companyTotals[company].count
  })).sort((a, b) => b.value - a.value);
};

export const getRamDistribution = (data: Laptop[]): AggregatedData[] => {
  if (!data || data.length === 0) return [];

  const ramCounts: Record<number, number> = {};
  
  data.forEach(l => {
    const ram = l.ram || 0;
    ramCounts[ram] = (ramCounts[ram] || 0) + 1;
  });

  return Object.keys(ramCounts).map(ram => ({
    label: `${ram}GB`,
    value: ramCounts[parseInt(ram)],
  })).sort((a, b) => parseInt(a.label) - parseInt(b.label));
};

export const getStats = (data: Laptop[]) => {
  if (!data || data.length === 0) {
    return {
      totalLaptops: 0,
      avgPrice: 0,
      mostPopularBrand: 'N/A',
      mostExpensive: null
    };
  }

  const totalLaptops = data.length;
  const avgPrice = data.reduce((acc, curr) => acc + curr.price, 0) / totalLaptops;
  
  const companyCounts: Record<string, number> = {};
  data.forEach(l => companyCounts[l.company] = (companyCounts[l.company] || 0) + 1);
  
  const keys = Object.keys(companyCounts);
  const mostPopularBrand = keys.length > 0 
    ? keys.reduce((a, b) => companyCounts[a] > companyCounts[b] ? a : b)
    : 'N/A';

  const maxPrice = Math.max(...data.map(l => l.price));
  const mostExpensive = data.find(l => l.price === maxPrice) || null;

  return {
    totalLaptops,
    avgPrice,
    mostPopularBrand,
    mostExpensive
  };
};
