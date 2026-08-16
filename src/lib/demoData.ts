import { Customer, Order, OrderItem, PaymentMethod } from '@/types/analytics';

const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Mateus', 'Felipe', 'Rodrigo', 'Bruno', 'Thiago', 'Gustavo', 'Rafael', 'Diego',
  'Juliana', 'Mariana', 'Camila', 'Beatriz', 'Larissa', 'Carolina', 'Amanda', 'Fernanda', 'Letícia', 'Bruna',
  'Eduardo', 'Guilherme', 'Leonardo', 'Renan', 'Vinicius', 'Alexandre', 'Daniel', 'Marcelo', 'André', 'Caio',
  'Vanessa', 'Priscila', 'Patrícia', 'Renata', 'Sabrina', 'Jessica', 'Natalia', 'Aline', 'Tatiane', 'Isabela'
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes',
  'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa',
  'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas'
];

const STATES = ['SP', 'SP', 'SP', 'RJ', 'RJ', 'MG', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'DF', 'GO', 'ES'];

const CATEGORIES = [
  { name: 'Eletrônicos & Tech', basePrice: 420, variance: 350 },
  { name: 'Moda & Vestuário', basePrice: 140, variance: 80 },
  { name: 'Casa & Decoração', basePrice: 210, variance: 150 },
  { name: 'Beleza & Saúde', basePrice: 110, variance: 60 },
  { name: 'Esportes & Fitness', basePrice: 180, variance: 110 },
  { name: 'Alimentos & Bebidas', basePrice: 85, variance: 45 },
];

const PAYMENT_METHODS: PaymentMethod[] = ['pix', 'credit_card', 'credit_card', 'credit_card', 'boleto', 'voucher'];

// Pseudo-random deterministic generator with seed for reproducible datasets
function createPseudoRandom(seed: number = 42) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateSyntheticDataset(orderCount = 4500): {
  customers: Customer[];
  orders: Order[];
  items: OrderItem[];
} {
  const random = createPseudoRandom(12345);
  const now = new Date();
  
  // Total of unique customers (~1,400 to simulate realistic repurchase and cohorts)
  const totalCustomers = 1350;
  const customers: Customer[] = [];
  const orders: Order[] = [];
  const items: OrderItem[] = [];

  // 1. Generate Customers with join dates spread across the last 15 months
  for (let i = 1; i <= totalCustomers; i++) {
    const fName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const state = STATES[Math.floor(random() * STATES.length)];
    const custId = `CUST-${String(i).padStart(5, '0')}`;

    // Acquisition month: 0 to 14 months ago
    const monthsAgo = Math.floor(random() * 15);
    const dayOfMonth = Math.floor(random() * 28) + 1;
    const hour = Math.floor(random() * 24);
    
    const joinDate = new Date(now.getFullYear(), now.getMonth() - monthsAgo, dayOfMonth, hour, 0, 0);

    customers.push({
      customer_id: custId,
      customer_name: `${fName} ${lName}`,
      customer_email: `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@empresa.com.br`,
      customer_state: state,
      created_at: joinDate.toISOString(),
    });
  }

  // 2. Generate Orders with Realistic Cohort Repurchase Decay
  let orderIndex = 1;

  customers.forEach((customer) => {
    const custCreatedAt = new Date(customer.created_at);
    
    // Always make initial order in the customer's creation month
    const initialOrderDate = new Date(custCreatedAt.getTime() + Math.floor(random() * 86400000));
    
    // Determine customer loyalty persona
    const personaRoll = random();
    let maxRepurchases = 0;
    let repurchaseProbability = 0.2;

    if (personaRoll > 0.88) {
      // High loyalty "Champion" (5-12 repurchases)
      maxRepurchases = Math.floor(random() * 8) + 5;
      repurchaseProbability = 0.75;
    } else if (personaRoll > 0.65) {
      // Moderate loyalty "Loyal" (2-5 repurchases)
      maxRepurchases = Math.floor(random() * 4) + 2;
      repurchaseProbability = 0.45;
    } else if (personaRoll > 0.40) {
      // Low loyalty (1-2 repurchases)
      maxRepurchases = Math.floor(random() * 2) + 1;
      repurchaseProbability = 0.25;
    } else {
      // Single purchase
      maxRepurchases = 0;
      repurchaseProbability = 0.05;
    }

    // First order
    const firstOrderId = `ORD-${String(orderIndex++).padStart(6, '0')}`;
    const firstCat = CATEGORIES[Math.floor(random() * CATEGORIES.length)];
    const firstPrice = Number((firstCat.basePrice + (random() * firstCat.variance - firstCat.variance / 2)).toFixed(2));
    const firstFreight = Number((15 + random() * 35).toFixed(2));
    const firstTotal = Number((firstPrice + firstFreight).toFixed(2));
    const payment = PAYMENT_METHODS[Math.floor(random() * PAYMENT_METHODS.length)];

    const firstOrderItem: OrderItem = {
      order_item_id: `ITEM-${String(orderIndex).padStart(6, '0')}-1`,
      order_id: firstOrderId,
      product_id: `PROD-${Math.floor(random() * 200) + 1}`,
      product_category: firstCat.name,
      price: firstPrice,
      freight_value: firstFreight,
    };
    items.push(firstOrderItem);

    orders.push({
      order_id: firstOrderId,
      customer_id: customer.customer_id,
      customer_name: customer.customer_name,
      customer_state: customer.customer_state,
      order_status: 'delivered',
      order_purchase_timestamp: initialOrderDate.toISOString(),
      total_amount: firstTotal,
      payment_method: payment,
      items: [firstOrderItem],
    });

    // Subsequent repurchases over following months
    let lastOrderDate = initialOrderDate;
    for (let r = 0; r < maxRepurchases; r++) {
      if (random() > repurchaseProbability) continue;

      // Interval of 20 to 65 days
      const daysLater = Math.floor(random() * 45) + 20;
      const nextDate = new Date(lastOrderDate.getTime() + daysLater * 86400000);
      
      // Don't generate future orders
      if (nextDate > now) break;

      lastOrderDate = nextDate;
      const repurchaseOrderId = `ORD-${String(orderIndex++).padStart(6, '0')}`;
      const repCat = CATEGORIES[Math.floor(random() * CATEGORIES.length)];
      const repPrice = Number((repCat.basePrice + (random() * repCat.variance - repCat.variance / 2)).toFixed(2));
      const repFreight = Number((12 + random() * 30).toFixed(2));
      const repTotal = Number((repPrice + repFreight).toFixed(2));
      const repPayment = PAYMENT_METHODS[Math.floor(random() * PAYMENT_METHODS.length)];

      const repItem: OrderItem = {
        order_item_id: `ITEM-${String(orderIndex).padStart(6, '0')}-1`,
        order_id: repurchaseOrderId,
        product_id: `PROD-${Math.floor(random() * 200) + 1}`,
        product_category: repCat.name,
        price: repPrice,
        freight_value: repFreight,
      };
      items.push(repItem);

      orders.push({
        order_id: repurchaseOrderId,
        customer_id: customer.customer_id,
        customer_name: customer.customer_name,
        customer_state: customer.customer_state,
        order_status: random() > 0.03 ? 'delivered' : 'canceled',
        order_purchase_timestamp: nextDate.toISOString(),
        total_amount: repTotal,
        payment_method: repPayment,
        items: [repItem],
      });
    }
  });

  // Sort orders chronologically
  orders.sort(
    (a, b) =>
      new Date(a.order_purchase_timestamp).getTime() -
      new Date(b.order_purchase_timestamp).getTime()
  );

  return { customers, orders, items };
}

// Singleton cached demo dataset
let cachedDataset: { customers: Customer[]; orders: Order[]; items: OrderItem[] } | null = null;

export function getDemoDataset() {
  if (!cachedDataset) {
    cachedDataset = generateSyntheticDataset(5200);
  }
  return cachedDataset;
}
