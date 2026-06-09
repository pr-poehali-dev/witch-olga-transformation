import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BOOKING_URL = "https://functions.poehali.dev/67e13010-ffe5-4416-931e-2c598d37af35";

const WITCH_PHOTO = "https://cdn.poehali.dev/projects/c72467d9-9466-4aff-a491-93b73966a89b/bucket/139a21c9-645a-4ec5-b44e-ee752826075a.jpg";
const WITCH_ART = "https://cdn.poehali.dev/projects/c72467d9-9466-4aff-a491-93b73966a89b/bucket/a186639e-0821-4e08-84cd-32b41e089aac.jpg";

const SERVICES = [
  { icon: "🪄", title: "Энергетическая чистка", desc: "Результат 100%. Устранение порчи, сглаза, негативных программ. Восстановление вашей природной силы и энергетики.", price: "от 5 000 ₽", symbol: "🦅" },
  { icon: "🔮", title: "Диагностика судьбы", desc: "Глубокий анализ вашей ситуации через дар ясновидения. Понимание причин и чёткий путь выхода.", price: "от 3 000 ₽", symbol: "💀" },
  { icon: "🖤", title: "Приворот", desc: "Работаю только с серьёзными, адекватными людьми. Индивидуальный подход к каждой ситуации. Результат обсуждается лично.", price: "индивидуально", symbol: "🐦‍⬛" },
  { icon: "🌑", title: "Работа с кармой", desc: "Исцеление кармических долгов и родовых программ. Освобождение от груза прошлых воплощений.", price: "от 10 000 ₽", symbol: "💀" },
  { icon: "🩸", title: "Привлечение удачи", desc: "Открытие финансовых потоков, привлечение успеха и процветания. Снятие денежных блоков.", price: "от 6 000 ₽", symbol: "🦅" },
  { icon: "🕯️", title: "Обряды и ритуалы", desc: "Индивидуальные обряды для защиты, исцеления и достижения целей. Работа с древними практиками.", price: "от 12 000 ₽", symbol: "🐦‍⬛" },
  { icon: "⚰️", title: "Кладбищенская чистка", desc: "Там, где другие не могут помочь — помогу я. Снятие кладбищенской порчи, отворот, поворот, глубокая очистка от смерти клиента. Работа с самыми тяжёлыми случаями.", price: "60 000 ₽", symbol: "💀" },
  { icon: "🛡️", title: "Создание амулетов", desc: "Мощные защитные амулеты от гибели и тяжёлых ранений. Особенно подходят для военных и людей в зоне опасности. Каждый амулет изготавливается индивидуально с личной привязкой.", price: "от 15 000 ₽", symbol: "🦅" },
];

const REVIEWS = [
  { name: "Анна М.", city: "Москва", text: "Ольга помогла мне выйти из тяжёлой ситуации в отношениях. Через три недели после обряда муж вернулся, и мы начали всё сначала. Безмерно благодарна.", stars: 5 },
  { name: "Елена К.", city: "Санкт-Петербург", text: "Делала энергетическую чистку. Ощущение невероятной лёгкости после сеанса — как будто сбросила огромный груз. Уже месяц всё идёт иначе.", stars: 5 },
  { name: "Марина С.", city: "Екатеринбург", text: "Обращалась по вопросу бизнеса. После работы с кармой дела пошли в гору, нашла нужных партнёров. Рекомендую всем, кто застрял.", stars: 5 },
  { name: "Светлана П.", city: "Казань", text: "Долго сомневалась, но решилась. Ольга очень чуткий человек, сразу поняла суть моей проблемы без лишних слов. Результат превзошёл ожидания.", stars: 5 },
];

const BLOG_POSTS = [
  { date: "2 июня 2026", tag: "Практика", title: "Как распознать порчу и сглаз: 7 верных признаков", excerpt: "Узнайте, какие симптомы указывают на негативное воздействие и как отличить обычные жизненные трудности от магических помех." },
  { date: "20 мая 2026", tag: "Магия", title: "Лунный календарь и ваша судьба", excerpt: "Луна управляет нашими эмоциями и энергетикой. Как использовать лунные фазы для магических практик и важных решений." },
  { date: "8 мая 2026", tag: "Карма", title: "Родовые программы: освободить себя и детей", excerpt: "Что передаётся нам по наследству через кровь и как разорвать цепочку негативных сценариев, повторяющихся поколение за поколением." },
];

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const TIME_SLOTS = ["10:00", "11:30", "13:00", "15:00", "16:30", "18:00", "19:30"];
const BUSY_SLOTS: Record<string, string[]> = {
  "2026-06-12": ["10:00", "13:00"],
  "2026-06-15": ["11:30", "15:00", "19:30"],
  "2026-06-18": ["10:00", "11:30", "13:00", "15:00"],
};

function StarField() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    delay: Math.random() * 4,
    duration: 2 + Math.random() * 3,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
}

function Calendar({ onBook }: { onBook: (date: string, time: string) => void }) {
  const today = new Date(2026, 5, 9);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const formatDate = (day: number) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const isToday = (day: number) => {
    return currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() === today.getMonth() &&
      day === today.getDate();
  };

  const isPast = (day: number) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return d < today;
  };

  const busyTimes = selectedDate ? (BUSY_SLOTS[selectedDate] || []) : [];

  return (
    <div className="mystic-card rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-yellow-400">
          <Icon name="ChevronLeft" size={16} />
        </button>
        <span className="text-yellow-400 text-lg tracking-widest uppercase" style={{ fontFamily: "'Cormorant SC', serif" }}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-yellow-400">
          <Icon name="ChevronRight" size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map((d) => (
          <div key={d} className="text-center" style={{ color: "rgba(212,175,55,0.4)", fontSize: "0.7rem", letterSpacing: "0.1em", height: "38px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const dateStr = formatDate(day);
          const past = isPast(day);
          const sel = selectedDate === dateStr;
          return (
            <div
              key={day}
              className={`calendar-day ${past ? "disabled" : ""} ${sel ? "selected" : ""} ${isToday(day) && !sel ? "today" : ""}`}
              onClick={() => {
                if (!past) {
                  setSelectedDate(dateStr);
                  setSelectedTime(null);
                }
              }}
            >
              {day}
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="space-y-3 border-t border-yellow-400/10 pt-4">
          <p className="text-xs tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Выберите время</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {TIME_SLOTS.map((t) => (
              <div
                key={t}
                className={`time-slot ${busyTimes.includes(t) ? "busy" : ""} ${selectedTime === t ? "selected-time" : ""}`}
                onClick={() => !busyTimes.includes(t) && setSelectedTime(t)}
              >
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && (
        <button
          className="btn-gold w-full py-3 rounded-xl text-sm font-medium tracking-widest"
          onClick={() => onBook(selectedDate, selectedTime)}
        >
          ✦ Записаться на консультацию ✦
        </button>
      )}
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bookingDone, setBookingDone] = useState<{ date: string; time: string } | null>(null);
  const [bookingForm, setBookingForm] = useState({ name: "", phone: "", service: "", message: "" });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [pendingBook, setPendingBook] = useState<{ date: string; time: string } | null>(null);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set(["home"]));

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setVisibleSections((prev) => new Set([...prev, id]));
            setActiveSection(id);
          }
        });
      },
      { threshold: 0.2 }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const handleBook = (date: string, time: string) => {
    setPendingBook({ date, time });
  };

  const handleSubmit = async () => {
    if (!pendingBook) return;
    if (!bookingForm.name || !bookingForm.phone) {
      setBookingError("Пожалуйста, заполните имя и контакт");
      return;
    }
    setBookingLoading(true);
    setBookingError("");
    try {
      const res = await fetch(BOOKING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingForm.name,
          phone: bookingForm.phone,
          service: bookingForm.service,
          message: bookingForm.message,
          date: pendingBook.date,
          time: pendingBook.time,
        }),
      });
      if (res.ok) {
        setBookingDone(pendingBook);
        setPendingBook(null);
        setBookingForm({ name: "", phone: "", service: "", message: "" });
      } else {
        setBookingError("Ошибка отправки. Попробуйте ещё раз.");
      }
    } catch {
      setBookingError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setBookingLoading(false);
    }
  };

  const sectionVisible = (id: string) => visibleSections.has(id);

  const navItems = [
    { id: "home", label: "Главная" },
    { id: "services", label: "Услуги" },
    { id: "about", label: "Обо мне" },
    { id: "reviews", label: "Отзывы" },
    { id: "blog", label: "Блог" },
    { id: "booking", label: "Запись" },
    { id: "contacts", label: "Контакты" },
  ];

  return (
    <div className="min-h-screen relative" style={{ background: "linear-gradient(180deg, #0d0618 0%, #120820 30%, #0a0515 60%, #0d0618 100%)" }}>
      <StarField />

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: "linear-gradient(180deg, rgba(10,5,20,0.95) 0%, transparent 100%)", backdropFilter: "blur(10px)" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="text-yellow-400 text-xl tracking-widest" style={{ fontFamily: "'Cormorant SC', serif" }}>
            ✦ Ведьма Ольга
          </button>

          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className={`nav-link ${activeSection === item.id ? "!text-yellow-400" : ""}`}>
                {item.label}
              </button>
            ))}
          </div>

          <button className="lg:hidden text-yellow-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 px-4 py-4 rounded-xl mystic-card mx-6">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="block w-full text-left nav-link py-3 border-b border-yellow-400/10 last:border-0">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" ref={(el) => { sectionRefs.current["home"] = el; }}
        className="relative min-h-screen flex items-center justify-center text-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(120,60,200,0.15) 0%, transparent 70%)" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="mb-6 inline-block px-4 py-1 rounded-full text-xs tracking-widest uppercase" style={{ border: "1px solid rgba(212,175,55,0.3)", color: "rgba(212,175,55,0.7)", fontFamily: "'Cormorant SC', serif" }}>
            ✦ Магические практики ✦
          </div>

          <h1 className="mb-6 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 8vw, 6rem)", fontWeight: 300 }}>
            <span className="gold-text">Ведьма</span>
            <br />
            <span style={{ color: "rgba(245, 230, 200, 0.95)" }}>Ольга</span>
          </h1>

          <div className="section-divider mb-6" />

          <p className="mb-6 leading-relaxed" style={{ color: "rgba(212, 175, 55, 0.6)", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "1.2rem" }}>
            Пространство трансформации и древней мудрости.<br />
            Где рождаются перемены, способные изменить вашу жизнь.
          </p>
          <div className="mb-8 inline-block px-5 py-2 rounded-full text-xs tracking-wider" style={{ border: "1px solid rgba(212,175,55,0.25)", color: "rgba(212,175,55,0.55)", fontFamily: "'Cormorant SC', serif" }}>
            ✦ Работаю на принципе энергообмена — бесплатных консультаций нет ✦
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-gold px-8 py-4 rounded-xl text-sm tracking-widest animate-pulse-gold" onClick={() => scrollTo("booking")}>
              ✦ Записаться на консультацию
            </button>
            <button onClick={() => scrollTo("services")}
              className="px-8 py-4 rounded-xl text-sm tracking-widest transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(212,175,55,0.3)", color: "rgba(212,175,55,0.8)", fontFamily: "'Cormorant SC', serif" }}>
              Узнать об услугах
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto">
            {[["16+", "лет опыта"], ["1 000+", "клиентов"], ["вся Россия", "география"]].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-light mb-1 gold-text" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{num}</div>
                <div className="text-xs tracking-wider" style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant SC', serif" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-float text-yellow-400/40">
          <Icon name="ChevronDown" size={24} />
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" ref={(el) => { sectionRefs.current["services"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-1000 ${sectionVisible("services") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Что я предлагаю</p>
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
              Магические <span className="gold-text">Услуги</span>
            </h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((s, i) => (
              <div key={i}
                className={`mystic-card rounded-2xl p-6 group hover:border-red-900/60 transition-all duration-500 cursor-pointer relative overflow-hidden ${sectionVisible("services") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute top-3 right-4 text-2xl opacity-20 group-hover:opacity-50 transition-opacity select-none">{s.symbol}</div>
                <div className="text-3xl mb-4">{s.icon}</div>
                <h3 className="text-xl mb-3 group-hover:text-red-400 transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: "rgba(245,220,220,0.9)" }}>
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(200,130,130,0.55)" }}>{s.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm gold-text" style={{ fontFamily: "'Cormorant SC', serif" }}>{s.price}</span>
                  <button onClick={() => scrollTo("booking")} className="text-xs tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "rgba(200,80,80,0.8)", fontFamily: "'Cormorant SC', serif" }}>
                    Записаться →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={(el) => { sectionRefs.current["about"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className={`relative transition-all duration-1000 ${sectionVisible("about") ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(140,0,0,0.3)" }}>
                  <img src={WITCH_PHOTO} alt="Ведьма Ольга" className="w-full h-72 object-cover" style={{ filter: "brightness(0.85) saturate(0.8)", objectPosition: "top" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(10,0,0,0.8) 100%)" }} />
                  <div className="absolute bottom-2 left-3 text-xs tracking-widest" style={{ color: "rgba(200,80,80,0.8)", fontFamily: "'Cormorant SC', serif" }}>Ольга</div>
                </div>
                <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(140,0,0,0.3)" }}>
                  <img src={WITCH_ART} alt="Тёмная ведьма" className="w-full h-72 object-cover" style={{ filter: "brightness(0.9) saturate(0.85)" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 50%, rgba(10,0,0,0.8) 100%)" }} />
                  <div className="absolute bottom-2 left-3 text-xs tracking-widest" style={{ color: "rgba(200,80,80,0.8)", fontFamily: "'Cormorant SC', serif" }}>Сила</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full flex items-center justify-center text-2xl animate-float mystic-card" style={{ border: "1px solid rgba(140,0,0,0.4)" }}>
                🐦‍⬛
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-200 ${sectionVisible("about") ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"}`}>
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Обо мне</p>
              <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
                Ольга, <span className="gold-text">36 лет</span>
              </h2>
              <div className="space-y-4 leading-relaxed" style={{ color: "rgba(212,175,55,0.55)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem" }}>
                <p>Я обладаю даром ясновидения — способностью видеть духов и различных сущностей. Этот дар открылся не случайно: я пережила три клинические смерти, и каждая из них изменила моё восприятие мира и углубила мои способности.</p>
                <p>Этот опыт научил меня ценить каждую жизнь и понимать то, что скрыто от обычного взгляда. Сегодня я использую свой дар для помощи людям — тем, кто оказался в сложной ситуации и не знает выхода.</p>
                <p>Я не просто практик — я человек, прошедший через границу между мирами. И именно это даёт мне силу помогать вам.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[["Ясновидение", "👁️"], ["Работа с духами", "🌙"], ["Энергетика", "⚡"], ["Помощь людям", "💜"]].map(([label, icon]) => (
                  <div key={label} className="flex items-center gap-2 text-sm" style={{ color: "rgba(212,175,55,0.6)" }}>
                    <span>{icon}</span>
                    <span style={{ fontFamily: "'Cormorant SC', serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" ref={(el) => { sectionRefs.current["reviews"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Истории клиентов</p>
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
              <span className="gold-text">Отзывы</span>
            </h2>
            <div className="section-divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REVIEWS.map((r, i) => (
              <div key={i}
                className={`mystic-card rounded-2xl p-6 transition-all duration-700 ${sectionVisible("reviews") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="flex mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="mb-4 leading-relaxed" style={{ color: "rgba(212,175,55,0.6)", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", fontStyle: "italic" }}>
                  "{r.text}"
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37" }}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div className="text-sm" style={{ color: "rgba(245,230,200,0.8)", fontFamily: "'Cormorant SC', serif" }}>{r.name}</div>
                    <div className="text-xs" style={{ color: "rgba(212,175,55,0.35)" }}>{r.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" ref={(el) => { sectionRefs.current["blog"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Знания и мудрость</p>
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
              <span className="gold-text">Блог</span>
            </h2>
            <div className="section-divider" />
          </div>

          <div className="space-y-6">
            {BLOG_POSTS.map((post, i) => (
              <div key={i}
                className={`mystic-card rounded-2xl p-6 group hover:border-yellow-400/40 transition-all duration-500 cursor-pointer ${sectionVisible("blog") ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="md:w-32 shrink-0 space-y-1">
                    <div className="text-xs tracking-widest" style={{ color: "rgba(212,175,55,0.35)", fontFamily: "'Cormorant SC', serif" }}>{post.date}</div>
                    <div className="text-xs px-2 py-0.5 rounded-full inline-block" style={{ border: "1px solid rgba(212,175,55,0.2)", color: "rgba(212,175,55,0.6)", fontFamily: "'Cormorant SC', serif" }}>
                      {post.tag}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-2 group-hover:text-yellow-400 transition-colors" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, color: "rgba(245,230,200,0.9)" }}>
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(212,175,55,0.5)" }}>{post.excerpt}</p>
                  </div>
                  <div className="text-yellow-400/30 group-hover:text-yellow-400/60 transition-colors shrink-0">
                    <Icon name="ArrowRight" size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" ref={(el) => { sectionRefs.current["booking"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Онлайн-запись</p>
            <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
              Записаться на <span className="gold-text">Консультацию</span>
            </h2>
            <div className="section-divider mb-4" />
            <p className="text-sm" style={{ color: "rgba(212,175,55,0.45)" }}>Выберите удобную дату и время — отвечу в течение часа</p>
          </div>

          {bookingDone ? (
            <div className="text-center py-16 mystic-card rounded-2xl max-w-lg mx-auto">
              <div className="text-5xl mb-6">✨</div>
              <h3 className="text-2xl mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "rgba(245,230,200,0.95)" }}>
                Заявка принята
              </h3>
              <p className="mb-2 text-sm" style={{ color: "rgba(212,175,55,0.6)" }}>
                Дата: <span className="text-yellow-400">{bookingDone.date}</span> в <span className="text-yellow-400">{bookingDone.time}</span>
              </p>
              <p className="text-sm" style={{ color: "rgba(212,175,55,0.45)" }}>Свяжусь с вами для подтверждения в ближайшее время</p>
              <button className="mt-6 btn-gold px-6 py-2 rounded-lg text-sm" onClick={() => setBookingDone(null)}>
                Записаться ещё раз
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Calendar onBook={handleBook} />

              <div className="mystic-card rounded-2xl p-6 space-y-5">
                <h3 className="text-lg tracking-wider" style={{ fontFamily: "'Cormorant SC', serif", color: "rgba(212,175,55,0.8)" }}>
                  Ваши данные
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs tracking-widest uppercase block mb-2" style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant SC', serif" }}>Имя</label>
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "rgba(40,20,60,0.5)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(245,230,200,0.8)", fontFamily: "'Golos Text', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="text-xs tracking-widest uppercase block mb-2" style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant SC', serif" }}>Телефон или Telegram</label>
                    <input
                      type="text"
                      placeholder="+7 (___) ___-__-__"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "rgba(40,20,60,0.5)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(245,230,200,0.8)", fontFamily: "'Golos Text', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="text-xs tracking-widest uppercase block mb-2" style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant SC', serif" }}>Услуга</label>
                    <select
                      value={bookingForm.service}
                      onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                      style={{ background: "rgba(40,20,60,0.8)", border: "1px solid rgba(212,175,55,0.2)", color: bookingForm.service ? "rgba(245,230,200,0.8)" : "rgba(212,175,55,0.35)", fontFamily: "'Golos Text', sans-serif" }}
                    >
                      <option value="" style={{ background: "#1a0d2e" }}>Выберите услугу...</option>
                      {SERVICES.map((s) => (
                        <option key={s.title} value={s.title} style={{ background: "#1a0d2e" }}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs tracking-widest uppercase block mb-2" style={{ color: "rgba(212,175,55,0.45)", fontFamily: "'Cormorant SC', serif" }}>Коротко о ситуации</label>
                    <textarea
                      rows={3}
                      placeholder="Опишите, с чем хотите обратиться..."
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                      style={{ background: "rgba(40,20,60,0.5)", border: "1px solid rgba(212,175,55,0.2)", color: "rgba(245,230,200,0.8)", fontFamily: "'Golos Text', sans-serif" }}
                    />
                  </div>
                </div>

                {pendingBook && (
                  <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.25)", color: "rgba(212,175,55,0.8)" }}>
                    📅 Выбрано: <strong>{pendingBook.date}</strong> в <strong>{pendingBook.time}</strong>
                  </div>
                )}

                {bookingError && (
                  <p className="text-sm" style={{ color: "#ff6b6b" }}>{bookingError}</p>
                )}

                <button
                  className="btn-gold w-full py-3 rounded-xl text-sm font-medium tracking-widest disabled:opacity-50"
                  onClick={handleSubmit}
                  disabled={bookingLoading || !pendingBook}
                >
                  {bookingLoading ? "Отправляем..." : "✦ Отправить заявку ✦"}
                </button>

                {!pendingBook && (
                  <p className="text-xs text-center" style={{ color: "rgba(212,175,55,0.3)" }}>
                    * Сначала выберите дату и время в календаре слева
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" ref={(el) => { sectionRefs.current["contacts"] = el; }} className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "rgba(212,175,55,0.5)", fontFamily: "'Cormorant SC', serif" }}>Связаться</p>
          <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, color: "rgba(245,230,200,0.95)" }}>
            <span className="gold-text">Контакты</span>
          </h2>
          <div className="section-divider mb-12" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "Phone", label: "Телефон", value: "+7 (999) 982-56-61", href: "tel:+79999825661" },
              { icon: "MessageCircle", label: "Telegram / WhatsApp", value: "+7 (925) 188-53-63", href: "https://t.me/+79251885363" },
              { icon: "Mail", label: "Email", value: "Olgazajceva332@gmail.com", href: "mailto:Olgazajceva332@gmail.com" },
            ].map(({ icon, label, value, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="mystic-card rounded-2xl p-6 flex flex-col items-center gap-3 hover:border-yellow-400/40 transition-all duration-300" style={{ textDecoration: "none" }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  <Icon name={icon} size={18} className="text-yellow-400" />
                </div>
                <div className="text-xs tracking-widest uppercase" style={{ color: "rgba(212,175,55,0.4)", fontFamily: "'Cormorant SC', serif" }}>{label}</div>
                <div className="text-sm" style={{ color: "rgba(245,230,200,0.8)" }}>{value}</div>
              </a>
            ))}
          </div>

          <div className="mystic-card rounded-2xl p-8">
            <p className="text-lg mb-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "rgba(212,175,55,0.6)" }}>
              "Волшебство возможно лишь тогда,<br />когда вы готовы открыться переменам."
            </p>
            <div className="section-divider mt-4" />
            <p className="mt-4 text-xs tracking-widest" style={{ color: "rgba(212,175,55,0.3)", fontFamily: "'Cormorant SC', serif" }}>— Ведьма Ольга</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-6 border-t relative z-10" style={{ borderColor: "rgba(212,175,55,0.1)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm" style={{ color: "rgba(212,175,55,0.3)", fontFamily: "'Cormorant SC', serif" }}>
            ✦ Ведьма Ольга © 2026
          </div>
          <div className="flex flex-wrap gap-6 justify-center">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => scrollTo(item.id)}
                className="text-xs nav-link">{item.label}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}