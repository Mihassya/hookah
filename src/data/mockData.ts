export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  volume?: string;
  // Добавили 4-ю вкладку для пива
  tabId: 'hookahs' | 'teas' | 'drinks' | 'beer'; 
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Table {
  id: number;
  number: number;
  cart: CartItem[];
}

export const MOCK_PRODUCTS: Product[] = [
  // === КАЛЬЯНЫ ===
  { id: 1, name: "Один кальян + класс. чай", price: 1100, category: "Комбо", tabId: 'hookahs' }, //
  { id: 2, name: "Кальян на фрукте + чай", price: 1800, category: "Комбо", tabId: 'hookahs' }, //
  { id: 3, name: "Бизнес часы Premium + чай", price: 1500, category: "Комбо", tabId: 'hookahs' }, //
  { id: 4, name: "Один кальян", price: 1300, category: "Классика", tabId: 'hookahs' }, //
  { id: 5, name: "Двойной кальян", price: 2200, category: "Классика", tabId: 'hookahs' }, //
  { id: 6, name: "Premium", price: 1500, category: "Классика", tabId: 'hookahs' }, //
  { id: 7, name: "Грейпфрутовая чаша", price: 1900, category: "На фрукте", tabId: 'hookahs' }, //
  { id: 8, name: "Гранатовая чаша", price: 2200, category: "На фрукте", tabId: 'hookahs' }, //
  { id: 9, name: "Ананасовая чаша", price: 2200, category: "На фрукте", tabId: 'hookahs' }, //

  // === ЧАИ ===
  // Ягодные
  { id: 10, name: "Чай Вишневый", price: 400, volume: "700мл", category: "Ягодный", tabId: 'teas' }, //
  { id: 11, name: "Чай облепиховый", price: 400, volume: "700мл", category: "Ягодный", tabId: 'teas' }, //
  { id: 12, name: "Черная смородина", price: 400, volume: "700мл", category: "Ягодный", tabId: 'teas' }, //
  // Китайские (Метод пролива)
  { id: 13, name: "Най Сян Дун Дин", price: 500, category: "Китайский", tabId: 'teas' }, //
  { id: 14, name: "Гун Тин Пуэр", price: 500, category: "Китайский", tabId: 'teas' }, //
  { id: 15, name: "Улун Те Гуаньинь", price: 500, category: "Китайский", tabId: 'teas' }, //
  { id: 16, name: "Улун Да Хун Пао", price: 500, category: "Китайский", tabId: 'teas' }, //
  { id: 17, name: "Дянь Хун Цзинь Хао", price: 500, category: "Китайский (Красный)", tabId: 'teas' }, //
  // Авторские
  { id: 18, name: "Таёжный сбор", price: 400, volume: "700мл", category: "Авторский", tabId: 'teas' }, //
  { id: 19, name: "Наглый апельсин", price: 400, volume: "700мл", category: "Авторский", tabId: 'teas' }, //
  { id: 20, name: "Кедровый", price: 400, volume: "700мл", category: "Авторский", tabId: 'teas' }, //
  { id: 21, name: "Гранатовый", price: 400, volume: "700мл", category: "Авторский", tabId: 'teas' }, //
  // Классические
  { id: 22, name: "Каркаде", price: 300, volume: "700мл", category: "Классический", tabId: 'teas' }, //
  { id: 23, name: "Эрл Грей", price: 300, volume: "700мл", category: "Классический", tabId: 'teas' }, //
  { id: 24, name: "Черный с чабрецом", price: 300, volume: "700мл", category: "Классический", tabId: 'teas' }, //
  { id: 25, name: "Молочный улун", price: 300, volume: "700мл", category: "Классический", tabId: 'teas' }, //
  { id: 26, name: "Зеленый Сенча", price: 300, volume: "700мл", category: "Классический", tabId: 'teas' }, //

  // === НАПИТКИ И ЛИМОНАДЫ ===
  // Лимонады 0.5 л
  { id: 27, name: "Барбариск", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 28, name: "Большая ягода", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 29, name: "Зеленое настроение", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 30, name: "Лесной аперитив", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 31, name: "Летний", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 32, name: "Мохито", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 33, name: "На чиле", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 34, name: "Свежий вайб", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 35, name: "Ягодный микс", price: 280, volume: "0.5 л", category: "Лимонады", tabId: 'drinks' }, //
  // Лимонады 1.0 л
  { id: 36, name: "Барбариск", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 37, name: "Большая ягода", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 38, name: "Зеленое настроение", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 39, name: "Лесной аперитив", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 40, name: "Летний", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 41, name: "Мохито", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 42, name: "На чиле", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 43, name: "Свежий вайб", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  { id: 44, name: "Ягодный микс", price: 450, volume: "1 л", category: "Лимонады", tabId: 'drinks' }, //
  // Энергетики
  { id: 45, name: "Burn оригинальный", price: 300, category: "Энергетики", tabId: 'drinks' }, //
  { id: 46, name: "Burn тропический микс", price: 300, category: "Энергетики", tabId: 'drinks' }, //
  { id: 47, name: "Burn яблоко киви", price: 300, category: "Энергетики", tabId: 'drinks' }, //
  // Газировка
  { id: 48, name: "Добрый апельсин", price: 200, volume: "0.25 л", category: "Газировка", tabId: 'drinks' }, //
  { id: 49, name: "Добрый кола", price: 200, volume: "0.25 л", category: "Газировка", tabId: 'drinks' }, //
  { id: 50, name: "Добрый кола без сахара", price: 200, volume: "0.25 л", category: "Газировка", tabId: 'drinks' }, //
  { id: 51, name: "Добрый лимон-лайм", price: 200, volume: "0.25 л", category: "Газировка", tabId: 'drinks' }, //
  // Соки
  { id: 52, name: "Сок апельсиновый", price: 200, category: "Соки", tabId: 'drinks' }, //
  { id: 53, name: "Сок вишневый", price: 200, category: "Соки", tabId: 'drinks' }, //
  { id: 54, name: "Сок яблочный", price: 200, category: "Соки", tabId: 'drinks' }, //

  // === ПИВО И СИДР ===
  { id: 55, name: "Chester's (Berries)", price: 300, volume: "0.45 л", category: "Сидр", tabId: 'beer' }, //
  { id: 56, name: "Chester's (Grapefruit)", price: 300, volume: "0.45 л", category: "Сидр", tabId: 'beer' }, //
  { id: 57, name: "Chester's (Pear)", price: 300, volume: "0.45 л", category: "Сидр", tabId: 'beer' }, //
  { id: 58, name: "Chester's (Apple)", price: 300, volume: "0.45 л", category: "Сидр", tabId: 'beer' }, //
  { id: 59, name: "Chester's (Peach Apricot)", price: 300, volume: "0.45 л", category: "Сидр", tabId: 'beer' }, //
  { id: 60, name: "Corona Extra", price: 350, volume: "0.355 л", category: "Пиво", tabId: 'beer' }, //
  { id: 61, name: "Hoegaarden", price: 300, volume: "0.44 л", category: "Пиво", tabId: 'beer' }, //
  { id: 62, name: "Hoegaarden (Cherry)", price: 300, volume: "0.44 л", category: "Пиво", tabId: 'beer' }, //
  { id: 63, name: "Hoegaarden (Grapefruit)", price: 300, volume: "0.44 л", category: "Пиво", tabId: 'beer' }, //
  { id: 64, name: "Paulaner", price: 400, volume: "0.5 л", category: "Пиво", tabId: 'beer' }, //
  { id: 65, name: "Stella Artois", price: 300, volume: "0.44 л", category: "Пиво", tabId: 'beer' }, //
  { id: 66, name: "Stella Artois (Non Alcohol)", price: 300, volume: "0.44 л", category: "Пиво", tabId: 'beer' } //
];

// При открытии смены все столы пустые (cart: [])
export const INITIAL_TABLES: Table[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  cart: [] 
}));