import { useState, useEffect } from "react"
import { INITIAL_TABLES, MOCK_PRODUCTS, Table, Product, CartItem } from "./data/mockData"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, ShoppingCart, Plus, Minus, Banknote, CreditCard, Smartphone, Clock, RotateCcw, Power, Play, FileText, AlertCircle } from "lucide-react"

// Типы данных
interface ClosedOrder {
  id: string;
  tableNumber: number;
  total: number;
  method: 'cash' | 'card' | 'transfer';
  timestamp: number;
  status: 'paid' | 'refunded';
  items: CartItem[];
}

interface ShiftArchive {
  id: string;
  startTime: number;
  endTime: number;
  totalRevenue: number;
  cashTotal: number;
  cardTotal: number;
  transferTotal: number;
  refundsTotal: number;
}

export default function App() {
  // --- СОСТОЯНИЯ (С АВТОСОХРАНЕНИЕМ) ---
  
  // 1. Статус смены
  const [isShiftOpen, setIsShiftOpen] = useState<boolean>(() => {
    return JSON.parse(localStorage.getItem("pos_is_shift_open") || "false")
  })
  const [shiftStartTime, setShiftStartTime] = useState<number | null>(() => {
    return JSON.parse(localStorage.getItem("pos_shift_start") || "null")
  })
  
  // 2. Архив смен (Z-отчеты)
  const [shiftArchive, setShiftArchive] = useState<ShiftArchive[]>(() => {
    return JSON.parse(localStorage.getItem("pos_shift_archive") || "[]")
  })

  // 3. Текущие данные смены
  const [tables, setTables] = useState<Table[]>(() => {
    return JSON.parse(localStorage.getItem("pos_tables_state") || JSON.stringify(INITIAL_TABLES))
  })
  const [shiftRevenue, setShiftRevenue] = useState<number>(() => {
    return JSON.parse(localStorage.getItem("pos_shift_revenue") || "0")
  })
  const [closedOrders, setClosedOrders] = useState<ClosedOrder[]>(() => {
    return JSON.parse(localStorage.getItem("pos_closed_orders") || "[]")
  })

  // 4. Управление интерфейсом
  const [activeTableId, setActiveTableId] = useState<number | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isZReportOpen, setIsZReportOpen] = useState(false)

  const activeTable = tables.find(t => t.id === activeTableId)

  // --- ЭФФЕКТЫ ---
  useEffect(() => { localStorage.setItem("pos_is_shift_open", JSON.stringify(isShiftOpen)) }, [isShiftOpen])
  useEffect(() => { localStorage.setItem("pos_shift_start", JSON.stringify(shiftStartTime)) }, [shiftStartTime])
  useEffect(() => { localStorage.setItem("pos_shift_archive", JSON.stringify(shiftArchive)) }, [shiftArchive])
  useEffect(() => { localStorage.setItem("pos_tables_state", JSON.stringify(tables)) }, [tables])
  useEffect(() => { localStorage.setItem("pos_shift_revenue", JSON.stringify(shiftRevenue)) }, [shiftRevenue])
  useEffect(() => { localStorage.setItem("pos_closed_orders", JSON.stringify(closedOrders)) }, [closedOrders])

  // --- БИЗНЕС-ЛОГИКА ---
  const getTableTotal = (table: Table) => table.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  const currentOpenRevenue = tables.reduce((acc, table) => acc + getTableTotal(table), 0)
  const hasOpenTables = tables.some(table => table.cart.length > 0) // Проверка на открытые столы

  // Корзина и заказы
  const addToCart = (product: Product) => {
    if (!activeTableId) return;
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table;
      const existingItem = table.cart.find(item => item.product.id === product.id);
      if (existingItem) {
        return { ...table, cart: table.cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
      }
      return { ...table, cart: [...table.cart, { product, quantity: 1 }] };
    }));
  }

  const removeFromCart = (productId: number) => {
    if (!activeTableId) return;
    setTables(prev => prev.map(table => {
      if (table.id !== activeTableId) return table;
      const existingItem = table.cart.find(item => item.product.id === productId);
      if (!existingItem) return table;
      if (existingItem.quantity === 1) {
        return { ...table, cart: table.cart.filter(item => item.product.id !== productId) };
      }
      return { ...table, cart: table.cart.map(item => item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item) };
    }));
  }

  const handleCheckout = (paymentMethod: 'cash' | 'card' | 'transfer') => {
    if (!activeTable) return;
    const total = getTableTotal(activeTable);

    const newOrder: ClosedOrder = {
      id: Math.random().toString(36).substr(2, 9),
      tableNumber: activeTable.number,
      total,
      method: paymentMethod,
      timestamp: Date.now(),
      status: 'paid',
      items: [...activeTable.cart]
    };

    setShiftRevenue(prev => prev + total);
    setClosedOrders(prev => [newOrder, ...prev]);
    setTables(prev => prev.map(table => table.id === activeTable.id ? { ...table, cart: [] } : table));
    
    setIsCheckoutOpen(false);
    setActiveTableId(null);
  }

  const handleRefund = (orderId: string) => {
    setClosedOrders(prev => prev.map(order => {
      if (order.id === orderId && order.status === 'paid') {
        setShiftRevenue(rev => rev - order.total);
        return { ...order, status: 'refunded' };
      }
      return order;
    }));
  }

  // --- ЛОГИКА СМЕНЫ (Z-ОТЧЕТ) ---
  const handleOpenShift = () => {
    setIsShiftOpen(true);
    setShiftStartTime(Date.now());
  }

  // Подсчет статистики для Z-отчета
  const cashTotal = closedOrders.filter(o => o.status === 'paid' && o.method === 'cash').reduce((sum, o) => sum + o.total, 0);
  const cardTotal = closedOrders.filter(o => o.status === 'paid' && o.method === 'card').reduce((sum, o) => sum + o.total, 0);
  const transferTotal = closedOrders.filter(o => o.status === 'paid' && o.method === 'transfer').reduce((sum, o) => sum + o.total, 0);
  const refundsTotal = closedOrders.filter(o => o.status === 'refunded').reduce((sum, o) => sum + o.total, 0);

  const handleCloseShift = () => {
    if (hasOpenTables) return; // Защита от закрытия с открытыми столами

    // 1. Сохраняем итоги в архив
    const shiftResult: ShiftArchive = {
      id: Math.random().toString(36).substr(2, 9),
      startTime: shiftStartTime || Date.now(),
      endTime: Date.now(),
      totalRevenue: shiftRevenue,
      cashTotal,
      cardTotal,
      transferTotal,
      refundsTotal
    };
    setShiftArchive(prev => [shiftResult, ...prev]);

    // 2. Сбрасываем кассу к заводским настройкам для новой смены
    setTables(INITIAL_TABLES);
    setShiftRevenue(0);
    setClosedOrders([]);
    setShiftStartTime(null);
    setIsShiftOpen(false);
    setIsZReportOpen(false);
  }

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ОТРИСОВКИ ---
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('ru-RU')
  const getMethodName = (m: string) => ({ cash: 'Наличные', card: 'Карта', transfer: 'Перевод' }[m] || m)

  const renderProductGrid = (tabId: string) => {
    const filteredProducts = MOCK_PRODUCTS.filter(p => p.tabId === tabId);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="cursor-pointer hover:border-slate-400 active:scale-95 transition-all flex flex-col" onClick={() => addToCart(product)}>
            <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{product.category}</p>
                <h3 className="font-semibold text-slate-800 leading-tight">{product.name}</h3>
                {product.volume && <p className="text-xs text-slate-400 mt-1">{product.volume}</p>}
              </div>
              <div className="text-lg font-bold text-slate-900">{product.price} ₽</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // --- ЭКРАН 1: ЗАКРЫТАЯ СМЕНА ---
  if (!isShiftOpen) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Power className="h-10 w-10 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Касса закрыта</h1>
          <p className="text-slate-500 mb-8">Откройте смену, чтобы начать принимать заказы и работать со столами.</p>
          <Button className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700" onClick={handleOpenShift}>
            <Play className="mr-2 h-5 w-5" />
            Открыть смену
          </Button>
        </div>
        
        {/* Мини-архив прошлых смен (только для просмотра) */}
        {shiftArchive.length > 0 && (
          <div className="mt-12 w-full max-w-2xl">
            <h3 className="text-slate-400 font-medium mb-4 text-center uppercase tracking-widest text-sm">Архив прошлых смен</h3>
            <div className="flex flex-col gap-3">
              {shiftArchive.slice(0, 3).map(shift => (
                <div key={shift.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex justify-between items-center text-slate-300">
                  <div>
                    <span className="font-semibold text-white mr-3">{formatDate(shift.startTime)}</span>
                    <span className="text-sm">{formatTime(shift.startTime)} — {formatTime(shift.endTime)}</span>
                  </div>
                  <div className="font-bold text-white text-lg">{shift.totalRevenue} ₽</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- ЭКРАН 2: ЗАКАЗ (МЕНЮ) ---
  if (activeTable) {
    const currentTotal = getTableTotal(activeTable);
    const isOccupied = activeTable.cart.length > 0;

    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Шапка меню оставлена без изменений */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setActiveTableId(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">Стол {activeTable.number}</h1>
          </div>
          <Badge className={!isOccupied ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-amber-500 text-white hover:bg-amber-600'}>
            {!isOccupied ? 'Свободен' : 'Занят'}
          </Badge>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <Tabs defaultValue="hookahs" className="w-full">
              <TabsList className="mb-6 h-12 bg-slate-200/60 p-1 w-full justify-start overflow-x-auto">
                <TabsTrigger value="hookahs" className="text-base px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Кальяны</TabsTrigger>
                <TabsTrigger value="teas" className="text-base px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Чаи</TabsTrigger>
                <TabsTrigger value="drinks" className="text-base px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Напитки</TabsTrigger>
                <TabsTrigger value="beer" className="text-base px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm whitespace-nowrap">Пиво и Сидр</TabsTrigger>
              </TabsList>
              <TabsContent value="hookahs" className="mt-0 outline-none">{renderProductGrid('hookahs')}</TabsContent>
              <TabsContent value="teas" className="mt-0 outline-none">{renderProductGrid('teas')}</TabsContent>
              <TabsContent value="drinks" className="mt-0 outline-none">{renderProductGrid('drinks')}</TabsContent>
              <TabsContent value="beer" className="mt-0 outline-none">{renderProductGrid('beer')}</TabsContent>
            </Tabs>
          </div>

          <div className="w-96 bg-white border-l flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)]">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-slate-600" />
              <h2 className="font-semibold text-slate-800">Чек стола</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {activeTable.cart.length === 0 ? (
                <div className="text-center text-slate-400 my-auto">
                  <p>Чек пуст</p>
                </div>
              ) : (
                activeTable.cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center gap-3 border-b pb-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 leading-tight">{item.product.name}</p>
                      <p className="text-xs text-slate-500">{item.product.price} ₽ / шт</p>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 rounded-md p-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFromCart(item.product.id)}>
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => addToCart(item.product)}>
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-semibold text-slate-900 w-16 text-right">
                      {item.product.price * item.quantity} ₽
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-500 font-medium">Итого:</span>
                <span className="text-2xl font-bold text-slate-900">{currentTotal} ₽</span>
              </div>

              <Button className="w-full h-12 text-lg font-semibold" disabled={!isOccupied} onClick={() => setIsCheckoutOpen(true)}>
                {!isOccupied ? 'Стол свободен' : 'Рассчитать стол'}
              </Button>

              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold">Оплата стола {activeTable.number}</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-6 py-4">
                    <div className="text-center">
                      <p className="text-slate-500 mb-1">К оплате</p>
                      <p className="text-5xl font-extrabold text-slate-900">{currentTotal} ₽</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className="h-28 flex flex-col gap-3 bg-green-50 hover:bg-green-100 hover:text-green-900 border-green-200" onClick={() => handleCheckout('cash')}>
                        <Banknote className="h-8 w-8 text-green-600" />
                        <span className="font-semibold">Наличные</span>
                      </Button>
                      <Button variant="outline" className="h-28 flex flex-col gap-3 bg-blue-50 hover:bg-blue-100 hover:text-blue-900 border-blue-200" onClick={() => handleCheckout('card')}>
                        <CreditCard className="h-8 w-8 text-blue-600" />
                        <span className="font-semibold">Карта</span>
                      </Button>
                      <Button variant="outline" className="h-28 flex flex-col gap-3 bg-purple-50 hover:bg-purple-100 hover:text-purple-900 border-purple-200" onClick={() => handleCheckout('transfer')}>
                        <Smartphone className="h-8 w-8 text-purple-600" />
                        <span className="font-semibold">Перевод</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

            </div>
          </div>
        </div>
      </div>
    )
  }

  // --- ЭКРАН 3: ЗАЛ (ОСНОВНОЙ) ---
  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Зал</h1>
          {shiftStartTime && <p className="text-sm text-slate-500 mt-1">Смена открыта с {formatTime(shiftStartTime)}</p>}
        </div>
        
        <div className="flex gap-4">
          <Button variant="outline" className="h-auto py-2 px-4 flex flex-col items-center gap-1 bg-white" onClick={() => setIsHistoryOpen(true)}>
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-600">История</span>
          </Button>

          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-md shadow-sm border border-slate-200 flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider text-slate-400">Открытые чеки</span>
            <span className="font-bold text-slate-700">{currentOpenRevenue} ₽</span>
          </div>
          <div className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-md shadow-sm flex flex-col justify-center">
            <span className="text-xs uppercase tracking-wider text-slate-400">Выручка смены</span>
            <span className="font-bold text-lg leading-none mt-1">{shiftRevenue} ₽</span>
          </div>

          {/* Кнопка Z-отчета */}
          <Button 
            variant="destructive" 
            className="h-auto py-2 px-4 flex flex-col items-center gap-1 ml-4"
            onClick={() => setIsZReportOpen(true)}
          >
            <Power className="h-4 w-4" />
            <span className="text-xs font-medium">Закрыть смену</span>
          </Button>
        </div>
      </header>

      {/* Модальное окно Z-отчета */}
      <Dialog open={isZReportOpen} onOpenChange={setIsZReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-slate-700" />
              Z-Отчет (Закрытие смены)
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 flex flex-col gap-4">
            {hasOpenTables && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 items-start border border-red-200">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Внимание: Есть открытые столы!</p>
                  <p className="text-sm mt-1">Вы не можете закрыть смену, пока в зале есть неоплаченные заказы. Рассчитайте гостей или отмените заказы.</p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 p-4 rounded-lg border flex flex-col gap-3">
              <div className="flex justify-between items-center text-slate-600">
                <span>Наличные:</span>
                <span className="font-semibold text-slate-900">{cashTotal} ₽</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Карта:</span>
                <span className="font-semibold text-slate-900">{cardTotal} ₽</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Перевод:</span>
                <span className="font-semibold text-slate-900">{transferTotal} ₽</span>
              </div>
              {refundsTotal > 0 && (
                <div className="flex justify-between items-center text-red-600 pt-2 border-t border-slate-200">
                  <span>Сумма возвратов:</span>
                  <span className="font-semibold">{refundsTotal} ₽</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xl font-bold mt-2 pt-3 border-t border-slate-300 text-slate-900">
                <span>Итог в кассе:</span>
                <span>{shiftRevenue} ₽</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZReportOpen(false)}>Отмена</Button>
            <Button 
              variant="destructive" 
              disabled={hasOpenTables} 
              onClick={handleCloseShift}
            >
              Снять Z-отчет и закрыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Окно Истории (без изменений) */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-2xl font-bold">История чеков (Текущая смена)</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4 pr-2 flex flex-col gap-3">
            {closedOrders.length === 0 ? (
              <p className="text-center text-slate-400 my-10">Закрытых чеков пока нет</p>
            ) : (
              closedOrders.map(order => (
                <div key={order.id} className={`p-4 border rounded-lg flex items-center justify-between ${order.status === 'refunded' ? 'bg-slate-50 opacity-60' : 'bg-white'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-lg">Стол {order.tableNumber}</span>
                      <Badge variant="outline">{formatTime(order.timestamp)}</Badge>
                      <Badge variant="secondary">{getMethodName(order.method)}</Badge>
                      {order.status === 'refunded' && <Badge variant="destructive">Возврат</Badge>}
                    </div>
                    <p className="text-sm text-slate-500 truncate max-w-md">
                      {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className={`text-xl font-bold ${order.status === 'refunded' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {order.total} ₽
                    </span>
                    {order.status === 'paid' && (
                      <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleRefund(order.id)}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Отменить
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Сетка столов */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => {
          const isOccupied = table.cart.length > 0;
          const tableTotal = getTableTotal(table);

          return (
            <Card key={table.id} onClick={() => setActiveTableId(table.id)} className="cursor-pointer hover:shadow-md transition-all active:scale-95 bg-white border-transparent hover:border-slate-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex justify-between items-center">
                  <span>Стол {table.number}</span>
                  <Badge className={!isOccupied ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-amber-500 text-white hover:bg-amber-600'}>
                    {!isOccupied ? 'Свободен' : 'Занят'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isOccupied ? (
                  <p className="text-2xl font-semibold text-slate-700">
                    {tableTotal} <span className="text-lg text-slate-400">₽</span>
                  </p>
                ) : (
                  <p className="text-slate-400 font-medium">Пусто</p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}