import React, { createContext, useContext, useEffect, useState } from "react"

export type Language = "ru" | "en"

type LanguageProviderProps = {
  children: React.ReactNode
  defaultLanguage?: Language
  storageKey?: string
}

type Translations = Record<string, string>

type LanguageProviderState = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string, section?: string) => string
}

const DICTIONARY: Record<Language, Record<string, Translations>> = {
  en: {
    common: {
      controlCenter: "Control Center",
      subtitle: "Platform operations, analytics, and security.",
      systemOnline: "System Online",
      systemDiagnostics: "System Diagnostics",
      uptime: "UPTIME",
      apiVer: "API VER",
      appBuild: "APP BUILD",
      env: "ENV",
      python: "PYTHON",
      resetDemo: "Reset Showcase Data",
      resettingDemo: "Resetting Demo...",
      signOut: "Sign out",
      loading: "Loading metrics...",
      hrs: "hrs",
      min: "min",
      sandboxBadge: "API Sandbox Derived",
      liveBadge: "Live Real-Time Data",
      sandboxStatic: "Sandbox Static",
      ok: "OK",
      cancel: "Cancel",
      searchHint: "Search vehicles, riders..."
    },
    stats: {
      activeVehicles: "Active Vehicles",
      matchingFleetSize: "matching fleet size",
      activeReservations: "Active Reservations",
      ongoingContracts: "ongoing client contracts",
      pendingVerifications: "Pending Verifications",
      documentsAudited: "documents to be audited",
      operatorRevenue: "Operators Revenue",
      grossMerchandiseVolume: "gross merchandise volume",
      totalUsers: "Total Users",
      owners: "Owners",
      riders: "Riders",
      totalVehicles: "Total Vehicles",
      free: "Free",
      rented: "Rented",
      reservations: "Reservations",
      done: "Done",
      cancelled: "Cancelled",
      utilization: "Fleet Utilization",
      utilizationSub: "Rented vs total fleet capacity"
    },
    revenue: {
      title: "Revenue Flow (Last 7 Days)",
      desc: "Daily gross volume across all processed payments and platform fees",
      tooltipName: "Revenue Flow",
      tooltipValue: "Daily revenue",
      platformFees: "Platform Fees",
      platformFeesDesc: "Standard platform commission on active reservations"
    },
    alerts: {
      title: "Action Required",
      desc: "Instant checklist of priority system anomalies & requests",
      noAlerts: "No critical alerts found. Fleet is operating normally.",
      unverifiedUsers: "unverified riders awaiting document审核",
      lowFuelCars: "vehicles reported running on extremely low fuel",
      unreturnedCars: "rentals overdue beyond estimated return window",
      disputes: "active financial dispute(s) requiring mediation",
      recheckBtn: "Audit Logs",
      verifyCta: "Verify Users",
      refuelCta: "Dispatch Service",
      overdueCta: "Contact Riders",
      disputeCta: "Open Billing",
      overdueReservations: "Overdue Reservations",
      bookingConflicts: "Booking Conflicts",
      noResponses: "No Responses",
      authFailures: "Auth Failures (24h)",
      exceptionsSub: "Operational exceptions"
    },
    engagement: {
      title: "User Engagement",
      desc: "Live active users and session metrics",
      activeDays: "Active (Last 30 Days)",
      loginsToday: "Logins Today",
      trending: "Trending",
      window24h: "24h window",
      owners: "Owners",
      riders: "Riders"
    },
    economics: {
      title: "Partners & Portfolio Economics",
      desc: "Partner fleet utilization, rental duration patterns, and revenue flow",
      vehiclesPerOperator: "Vehicles / Operator",
      vehiclesPerOperatorSub: "Avg vehicles per operator and size",
      avgRentDuration: "Avg Rent Duration",
      avgRentDurationSub: "Averages for standard renter reservations (days)",
      avgTicket: "Average Ticket (AOV)",
      avgTicketSub: "Average successful deal basket size",
      fleetRunRate: "Active Fleet Run-rate",
      fleetRunRateSub: "Revenues projected for the next 30 days",
      days: "days",
      avg: "avg",
      activeLabel: "active",
      tooltipVehiclesPerOwner: "Vehicles / Operator: Shows average fleet size per partner-owner. Helps evaluate the concentration of assets with large sub-landlords.",
      tooltipRentDuration: "Average Rental Duration: Average number of days customers book vehicles for. Aids in tariff grid optimization.",
      tooltipAOV: "AOV (Average Order Value): Average successful reservation transaction value. Strongly correlates with utility pricing.",
      tooltipRunRate: "Active Fleet Run-rate: 30-day linear revenue projection calculated as 'Rented Vehicles' * 'Average daily rate' * 30.",
      activeOperators: "Active Operators",
      avgForActive: "Avg for Active",
      totalBookings: "Total Bookings",
      activeRentals: "Active Rentals",
      ongoing: "ongoing",
      aovTrend: "AOV trend",
      projectedGross: "Projected Monthly Gross",
      run30days: "30-day run",
      cars: "cars"
    },
    fleet: {
      title: "Fleet Status",
      desc: "Current utilization and maintenance profiles across vehicles",
      totalCars: "cars total",
      statusHeader: "Vehicle status",
      shareHeader: "Share / Count",
      freeName: "Free",
      freeDesc: "Ready for rental, visible to riders in mobile app",
      rentedName: "Rented",
      rentedDesc: "Vehicles currently in possession of active riders",
      draftName: "Draft",
      draftDesc: "New vehicles undergoing onboarding/moderation",
      maintenanceName: "Maintenance",
      maintenanceDesc: "Service bay active checklist, temporarily locked",
      archivedName: "Archived",
      archivedDesc: "Decommissioned or hidden inventory archive"
    },
    opensearch: {
      title: "OpenSearch Cluster",
      desc: "Monitoring of indexed records, search latency, and memory health",
      statusHeader: "Cluster State",
      latencyHeader: "Avg Latency",
      heapHeader: "JVM Heap Memory",
      metricsSub: "Shard replication details",
      latencySub: "Search result delivery speed",
      heapSub: "Hot-node container JVM utilization",
      totalSize: "Total size",
      registriesHeader: "Index Registries",
      indexesCount: "indexes",
      docs: "docs",
      re_sharding: "RE-SHARDING",
      healthy: "HEALTHY",
      degraded: "DEGRADED"
    },
    booking: {
      title: "Booking Status",
      desc: "Transaction lifecycle and order resolution metrics",
      totalBookings: "total bookings",
      statusHeader: "Status",
      shareHeader: "Share / Count",
      completedName: "Completed",
      completedDesc: "Successful trips fully paid and closed",
      collectedName: "In Trip",
      collectedDesc: "Riders driving active vehicles at this moment",
      confirmedName: "Confirmed",
      confirmedDesc: "Prepaid to operator, awaiting collection/delivery",
      overdueName: "Overdue",
      overdueDesc: "Return window has slipped, vehicles are overdue",
      cancelledName: "Cancelled",
      cancelledDesc: "Cancelled by renters or declined by fleet operators"
    },
    velocity: {
      title: "Reservations / Hour",
      desc: "Hourly breakdown of order velocity throughout selected day",
      tooltipHint: "Shows hourly intake of bookings. Helps schedule customer service staffing."
    },
    demand: {
      title: "Demand by Vehicle Type",
      desc: "Distribution of cars rented actively grouped by classification",
      tooltipHint: "Rented categories breakdown (SUV, Sedan, Electric). Assists in acquisitions."
    }
  },
  ru: {
    common: {
      controlCenter: "Центр Управления",
      subtitle: "Операционная деятельность, аналитика и безопасность платформы.",
      systemOnline: "Система в Сети",
      systemDiagnostics: "Диагностика Системы",
      uptime: "АПТАЙМ",
      apiVer: "ВЕРСИЯ API",
      appBuild: "СБОРКА",
      env: "ОКРУЖЕНИЕ",
      python: "PYTHON",
      resetDemo: "Сбросить демо-данные",
      resettingDemo: "Сброс данных...",
      signOut: "Выйти из системы",
      loading: "Загрузка аналитики...",
      hrs: "ч",
      min: "мин",
      sandboxBadge: "API Sandbox Sandbox",
      liveBadge: "Реальные данные",
      sandboxStatic: "Статичный мок",
      ok: "ОК",
      cancel: "Отмена",
      searchHint: "Поиск машин, арендаторов..."
    },
    stats: {
      activeVehicles: "Активные Машины",
      matchingFleetSize: "общий размер автопарка",
      activeReservations: "Активные Заказы",
      ongoingContracts: "действующие контракты поездок",
      pendingVerifications: "Ожидают Проверки",
      documentsAudited: "документы для ручной проверки",
      operatorRevenue: "Выручка Владельцев",
      grossMerchandiseVolume: "совокупный оборот платежей",
      totalUsers: "Всего пользователей",
      owners: "Владельцы",
      riders: "Клиенты",
      totalVehicles: "Всего автомобилей",
      free: "Свободно",
      rented: "В аренде",
      reservations: "Бронирования",
      done: "Выполнено",
      cancelled: "Отменено",
      utilization: "Утилизация флота",
      utilizationSub: "Доля rented от общего пула машин"
    },
    revenue: {
      title: "Денежный поток (последние 7 дней)",
      desc: "Дневной оборот арендной платы и сервисных комиссий платформы (Gross Volume)",
      tooltipName: "Оборот",
      tooltipValue: "Дневная выручка",
      platformFees: "Комиссии Платформы",
      platformFeesDesc: "Сервисный сбор платформы с активных бронирований клиентов"
    },
    alerts: {
      title: "Требует Внимания",
      desc: "Срочный чек-лист оперативных аномалий, инцидентов и запросов",
      noAlerts: "Критических инцидентов не зафиксировано. Все системы в норме.",
      unverifiedUsers: "клиентов ожидают подтверждения профиля",
      lowFuelCars: "машин сообщают о критическом резерве топлива",
      unreturnedCars: "заказов просрочено по времени возврата",
      disputes: "драфт-конфликтов требуют ручной модерации",
      recheckBtn: "Логи аудита",
      verifyCta: "Проверить",
      refuelCta: "Заправить",
      overdueCta: "Связаться",
      disputeCta: "Транзакции",
      overdueReservations: "Просроченные аренды",
      bookingConflicts: "Конфликты бронирования",
      noResponses: "Без ответа операторов",
      authFailures: "Сбои авторизации (24ч)",
      exceptionsSub: "Операционные сбои и аномалии"
    },
    engagement: {
      title: "Активность клиентов",
      desc: "Анализ посещаемости и сессий пользователей",
      activeDays: "Активны (за 30 дней)",
      loginsToday: "Посещения сегодня",
      trending: "Растет",
      window24h: "за 24 часа",
      owners: "Владельцы",
      riders: "Клиенты"
    },
    economics: {
      title: "Эффективность партнеров-операторов",
      desc: "Параметры утилизации автопарка партнеров, длительность сессий и финансовые метрики",
      vehiclesPerOperator: "Машин / Оператор",
      vehiclesPerOperatorSub: "Владеют машин в среднем",
      avgRentDuration: "Ср. срок аренды",
      avgRentDurationSub: "Среднее количество суток в заказе",
      avgTicket: "Средний чек (AOV)",
      avgTicketSub: "Средняя стоимость успешной сделки",
      fleetRunRate: "Прогноз флота за 30 дней",
      fleetRunRateSub: "Линейный прогноз выручки флота за месяц",
      days: "дней",
      avg: "ср. знач.",
      activeLabel: "активны",
      tooltipVehiclesPerOwner: "Машин на оператора: Показывает средний размер автопарка у партнеров-владельцев. Помогает оценивать концентрацию активов у крупных субарендаторов.",
      tooltipRentDuration: "Средняя длительность аренды: Среднее количество дней, на которое клиенты (Riders) бронируют автомобили. Позволяет оптимизировать тарифные сетки.",
      tooltipAOV: "AOV (Average Order Value): Средний чек одной совершенной поездки. Коррелирует с тарифом и загрузкой автопарка.",
      tooltipRunRate: "Active Fleet Run-rate: Месячная экстраполяция выручки на основе текущих активных контрактов аренды. Рассчитывается как: 'Кол-во арендованных машин' × 'Среднесуточный тариф ' × 30 дней.",
      activeOperators: "Активные партнеры",
      avgForActive: "Ср. для активных",
      totalBookings: "Всего заказов",
      activeRentals: "Активные аренды",
      ongoing: "в аренде",
      aovTrend: "Тренд AOV",
      projectedGross: "Месячный прогноз",
      run30days: "за 30 дней",
      cars: "машин"
    },
    fleet: {
      title: "Статус Автопарка",
      desc: "Текущая утилизация, техническое состояние и доступность машин",
      totalCars: "машин всего",
      statusHeader: "Статус авто",
      shareHeader: "Доля / Кол-во",
      freeName: "Свободно",
      freeDesc: "Машины готовы к аренде и видны клиентам в приложении",
      rentedName: "В аренде",
      rentedDesc: "Автомобили находятся у арендаторов на руках",
      draftName: "Черновик",
      draftDesc: "Новые машины в процессе модерации/добавления",
      maintenanceName: "В ремонте",
      maintenanceDesc: "Проходят сервисное обслуживание, временно заблокированы",
      archivedName: "В архиве",
      archivedDesc: "Списанные или временно скрытые автомобили"
    },
    opensearch: {
      title: "Кластер OpenSearch",
      desc: "Параметры поискового движка, задержка поиска предложений и JVM heap",
      statusHeader: "Статус Кластера",
      latencyHeader: "Ср. Задержка",
      heapHeader: "Мониторинг JVM",
      metricsSub: "Репликация поисковых шардов",
      latencySub: "Скорость отдачи результатов",
      heapSub: "Занято памяти JVM в контейнере",
      totalSize: "Общий размер",
      registriesHeader: "Размер Индексов",
      indexesCount: "индексов",
      docs: "док.",
      re_sharding: "ПЕРЕБАЛАНСИРОВКА",
      healthy: "АКТИВЕН",
      degraded: "СБОЙ"
    },
    booking: {
      title: "Статус Бронирований",
      desc: "Жизненный цикл сделок, распределение заказов по этапам жизненного цикла",
      totalBookings: "заказов всего",
      statusHeader: "Статус заказа",
      shareHeader: "Доля / Кол-во",
      completedName: "Выполнен",
      completedDesc: "Успешные поездки завершены, оплата получена владельцем",
      collectedName: "В пути",
      collectedDesc: "Клиент находится за рулем автомобиля прямо сейчас",
      confirmedName: "Подтвержден",
      confirmedDesc: "Заказы предоплачены оператору и ожидают выдачи клиенту",
      overdueName: "Просрочен",
      overdueDesc: "Срок аренды истек, возврат автомобиля задерживается",
      cancelledName: "Отменен",
      cancelledDesc: "Сделки отменены клиентом или отклонены владельцем"
    },
    velocity: {
      title: "Активность / Час",
      desc: "Скорость поступления бронирований (Заказы по часам)",
      tooltipHint: "Отображает скорость поступления новых заказов по часам. Помогает распределять нагрузку на поддержку."
    },
    demand: {
      title: "Спрос по классам машин",
      desc: "Концентрация активной аренды в разрезе категорий кузова",
      tooltipHint: "Распределение активной аренды (SUV, седаны, электро). Помогает расширять флот."
    }
  }
}

const LanguageContext = createContext<LanguageProviderState | undefined>(undefined)

export function LanguageProvider({
  children,
  defaultLanguage = "ru",
  storageKey = "ownima-admin-lang"
}: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem(storageKey) as Language) || defaultLanguage
  )

  useEffect(() => {
    localStorage.setItem(storageKey, language)
  }, [language, storageKey])

  const t = (key: string, section: string = "common"): string => {
    const translation = DICTIONARY[language]?.[section]?.[key]
    if (translation !== undefined) {
      return translation
    }
    // Deep fallback to English
    const fallback = DICTIONARY.en?.[section]?.[key]
    return fallback !== undefined ? fallback : key
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }
  return context
}
