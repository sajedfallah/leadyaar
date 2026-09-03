const leads = [
  { name: "شرکت آریا صنعت یزد", score: 91, field: "تولید قطعات صنعتی", status: "اولویت بالا" },
  { name: "بازرگانی خلیج پارس", score: 87, field: "واردات تجهیزات", status: "مناسب" },
  { name: "صنایع فلزی کویر", score: 78, field: "ماشین‌آلات و مواد اولیه", status: "بررسی امروز" },
];

export default function Home() {
  return (
    <main className="shell">
      <header className="brandbar">
        <div className="logo">ل</div>
        <div>
          <strong>لیدیار</strong>
          <span>دستیار هوشمند جذب مشتری</span>
        </div>
      </header>

      <section className="hero card">
        <div>
          <p className="eyebrow">هدف این ماه</p>
          <h1>۵ / ۱۰ مشتری</h1>
          <p>۵ مشتری دیگر تا هدف ماهانه</p>
        </div>
        <div className="progress"><i /></div>
      </section>

      <section>
        <div className="sectionTitle">
          <h2>برنامه امروز</h2>
          <span>پنجشنبه، ۱۲ شهریور</span>
        </div>
        <div className="stats">
          <article className="card"><b>۱۰</b><span>لید جدید</span></article>
          <article className="card"><b>۴</b><span>پیگیری</span></article>
          <article className="card"><b>۲</b><span>مذاکره فعال</span></article>
        </div>
        <button className="primary">شروع کار امروز</button>
      </section>

      <section>
        <div className="sectionTitle"><h2>لیدهای پیشنهادی</h2><button>مشاهده همه</button></div>
        <div className="leadList">
          {leads.map((lead) => (
            <article className="lead card" key={lead.name}>
              <div className="score">{lead.score}</div>
              <div className="leadText"><strong>{lead.name}</strong><span>{lead.field}</span></div>
              <em>{lead.status}</em>
            </article>
          ))}
        </div>
      </section>

      <section className="insight card">
        <div className="spark">✦</div>
        <div><p className="eyebrow">تحلیل هوش مصنوعی</p><strong>شرکت‌های تولیدی یزد بالاترین اولویت تماس امروز را دارند.</strong></div>
      </section>

      <nav className="nav">
        <a className="active">خانه</a><a>لیدها</a><a>Pipeline</a><a>AI</a><a>حساب من</a>
      </nav>
    </main>
  );
}
