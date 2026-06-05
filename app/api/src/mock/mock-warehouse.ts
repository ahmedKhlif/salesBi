import type {
  MockCustomer,
  MockProduct,
  MockSaleLine,
  MockSalesRep,
  WarehouseData,
} from '../common/types/domain';

const cities = [
  'Tunis',
  'Sfax',
  'Sousse',
  'Gabes',
  'Bizerte',
  'Nabeul',
  'Monastir',
  'Ariana',
  'Kairouan',
  'Medenine',
];

const customerStatuses = ['Active', 'Prospect', 'Lead'];
const customerTypes = ['Individual', 'Business'];
const paymentStatuses = ['Paid', 'Partial', 'Pending'];
const orderStatuses = ['Confirmed', 'Delivered', 'Processing', 'Shipped'];
const firstNames = [
  'Ahmed',
  'Meriem',
  'Youssef',
  'Sarra',
  'Nour',
  'Khalil',
  'Aya',
  'Wassim',
  'Leila',
  'Omar',
];
const lastNames = [
  'Ben Ali',
  'Trabelsi',
  'Gharbi',
  'Mansouri',
  'Jlassi',
  'Saidi',
  'Kefi',
  'Bouzid',
  'Cherif',
  'Mejri',
];
const productFamilies = [
  'Analytics',
  'Warehouse',
  'Cloud',
  'Retail',
  'Service',
  'Mobile',
  'CRM',
  'ERP',
];

function seeded(seed: number) {
  return Math.abs(Math.sin(seed * 9_973.17) * 10_000) % 1;
}

function pad(value: number) {
  return value.toString().padStart(2, '0');
}

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  return `${year}-${month}-${day}`;
}

function dateKeyFromIso(iso: string) {
  return Number(iso.replaceAll('-', ''));
}

function buildProducts(): MockProduct[] {
  return Array.from({ length: 150 }, (_, index) => {
    const seed = index + 1;
    const standardCost = 40 + Math.round(seeded(seed) * 1_200);
    const listPrice =
      standardCost + 30 + Math.round(seeded(seed + 100) * 2_000);
    return {
      productId: seed,
      productName: `${productFamilies[index % productFamilies.length]} Suite ${pad(seed)}`,
      standardCost,
      listPrice,
    };
  });
}

function buildCustomers(): MockCustomer[] {
  return Array.from({ length: 100 }, (_, index) => {
    const seed = index + 1;
    return {
      customerId: seed,
      customerCode: `CUS-${seed.toString().padStart(3, '0')}`,
      customerType: customerTypes[index % customerTypes.length],
      firstName: firstNames[index % firstNames.length],
      lastName: lastNames[(index * 3) % lastNames.length],
      city: cities[index % cities.length],
      customerStatus:
        index < 90
          ? 'Active'
          : customerStatuses[
              ((index - 90) % (customerStatuses.length - 1)) + 1
            ],
      paymentTermsDays: [15, 30, 45, 60][index % 4],
      registrationDate: formatDate(
        new Date(
          Date.UTC(
            2024,
            Math.floor(seeded(seed) * 12),
            1 + Math.floor(seeded(seed + 20) * 27),
          ),
        ),
      ),
    };
  });
}

function buildSalesReps(): MockSalesRep[] {
  return Array.from({ length: 50 }, (_, index) => {
    const seed = index + 1;
    const firstName = firstNames[(index + 2) % firstNames.length];
    const lastName = lastNames[(index + 5) % lastNames.length];
    return {
      employeeId: seed,
      employeeCode: `REP-${seed.toString().padStart(3, '0')}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '')}@saleslens.tn`,
    };
  });
}

function buildDates() {
  const start = new Date(Date.UTC(2025, 4, 24));
  return Array.from({ length: 180 }, (_, index) => {
    const next = new Date(start);
    next.setUTCDate(start.getUTCDate() + index);
    return formatDate(next);
  });
}

function buildSales(
  dates: string[],
  products: MockProduct[],
  customers: MockCustomer[],
  salesReps: MockSalesRep[],
): MockSaleLine[] {
  let orderDetailId = 1;
  return dates.flatMap((fullDate, dayIndex) =>
    Array.from({ length: 18 }, (_, rowIndex) => {
      const seed = dayIndex * 18 + rowIndex + 1;
      const product = products[(seed * 7) % products.length];
      const customer = customers[(seed * 5) % customers.length];
      const rep = salesReps[(seed * 3) % salesReps.length];
      const quantity = 1 + Math.floor(seeded(seed) * 9);
      const priceFactor = 0.85 + seeded(seed + 4) * 0.35;
      const unitPrice = Math.round(product.listPrice * priceFactor * 100) / 100;
      const grossAmount = unitPrice * quantity;
      const discountRate =
        seeded(seed + 7) > 0.72 ? 0.02 + seeded(seed + 9) * 0.08 : 0;
      const discountAmount = Math.round(grossAmount * discountRate * 100) / 100;
      const netSalesWithoutTax =
        Math.round((grossAmount - discountAmount) * 100) / 100;
      const taxAmount = Math.round(netSalesWithoutTax * 0.19 * 100) / 100;
      const lineTotal =
        Math.round((netSalesWithoutTax + taxAmount) * 100) / 100;
      const date = new Date(`${fullDate}T00:00:00.000Z`);

      return {
        salesOrderId: 1 + Math.floor(orderDetailId / 3),
        orderDetailId: orderDetailId++,
        dateKey: dateKeyFromIso(fullDate),
        fullDate,
        year: date.getUTCFullYear(),
        quarter: Math.floor(date.getUTCMonth() / 3) + 1,
        monthNumber: date.getUTCMonth() + 1,
        monthName: date.toLocaleString('en-US', {
          month: 'long',
          timeZone: 'UTC',
        }),
        dayNumber: date.getUTCDate(),
        customerId: customer.customerId,
        productId: product.productId,
        employeeId: rep.employeeId,
        quantity,
        unitPrice,
        discountAmount,
        taxAmount,
        lineTotal,
        netSalesWithoutTax,
        orderStatus: orderStatuses[seed % orderStatuses.length],
        paymentStatus: paymentStatuses[seed % paymentStatuses.length],
      };
    }),
  );
}

export function createMockWarehouse(): WarehouseData {
  const products = buildProducts();
  const customers = buildCustomers();
  const salesReps = buildSalesReps();
  const dates = buildDates();
  const sales = buildSales(dates, products, customers, salesReps);
  return { products, customers, salesReps, sales, dates };
}

export const mockWarehouse = createMockWarehouse();
