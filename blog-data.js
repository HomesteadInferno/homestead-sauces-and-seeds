// ═══════════════════════════════════════════════════════════════
// 📰 BLOG DATA — Gapka Homestead Inferno
// База статей для динамічного блогу
// ═══════════════════════════════════════════════════════════════

const blogPosts = [
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ВИРОЩУВАННЯ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    {
        id: 'evolution-inferno-2026',
        title: 'Еволюція Inferno: Як народжується врожай суперхотів',
        slug: 'evolution-inferno-2026',
        category: 'growing',
        categoryLabel: 'Вирощування',
        date: '2026-03-14',
        author: 'Gapka',
        readTime: '5 хв',
        image: 'images/photo_2026-04-11_17-48-47.jpg',
        featured: true,
        excerpt: 'Часто нас питають: "А чи точно воно виросте?". Замість тисячі слів ми просто показуємо наш сімейний архів пророщування суперхотів цього сезону.',
        content: `
            <p class="article-intro">Часто нас питають: "А чи точно воно виросте?". Замість тисячі слів ми просто показуємо наш сімейний архів пророщування суперхотів цього сезону.</p>

            <div class="photo-timeline">
                <div class="timeline-item">
                    <img src="images/photo_1_2026-03-14_15-41-58.jpg" alt="24 лютого">
                    <p><strong>24 лютого:</strong> Перші сміливці. Тут почався розвиток перших справжніх листків. У цей момент головне — світло і тепло.</p>
                </div>

                <div class="timeline-item">
                    <img src="images/photo_2_2026-03-14_15-41-58.jpg" alt="27 лютого">
                    <p><strong>27 лютого:</strong> Перша пікіровка. Малюки отримали свої окремі "квартири" — перші горщики.</p>
                </div>

                <div class="timeline-item">
                    <img src="images/photo_3_2026-03-14_15-41-58.jpg" alt="10 березня">
                    <p><strong>10 березня:</strong> Формування другої пари справжніх листків. Коренева система зміцнюється.</p>
                </div>

                <div class="timeline-item">
                    <img src="images/photo_6_2026-03-14_15-41-58.jpg" alt="14 березня">
                    <p><strong>14 березня:</strong> Вибуховий ріст! Це вже підлітки з характером. Вони готові підкорювати цей великий світ.</p>
                </div>

                <div class="timeline-item">
                    <img src="images/photo_2026-03-15_14-32-02.jpg" alt="15 березня">
                    <p><strong>15 березня:</strong> Ці хлопці та дівчата вже починають набувати характеру.</p>
                </div>
                <div class="timeline-item">
                    <img src="images/photo_2026-04-11_17-48-47.jpg" alt="11 квітня">
                    <p><strong>11 квітня:</strong> Вони готові до справжньої землі!</p>
                </div>
            </div>
            <blockquote class="article-quote">
                <strong>Наш секрет успіху:</strong> Ми не просто садимо насіння. Ми стежимо за кожним етапом і відбираємо лише найсильніших "атлетів".
            </blockquote>
        `,
        tags: ['суперхоти', 'розсада', 'вирощування', 'фото-звіт']
    },

    {
        id: 'superhots-drama-queen',
        title: 'Суперхоти: Шлях терпіння та драми',
        slug: 'superhots-drama-queen',
        category: 'tips',
        categoryLabel: 'Поради',
        date: '2026-03-10',
        author: 'Gapka',
        readTime: '8 хв',
        image: 'images/Habanerochocolate.png',
        featured: false,
        excerpt: 'Ви вирішили виростити щось гостріше за звичайний "Вогник"? Забудьте все, що знали про перці. Суперхоти грають за власними правилами!',
        content: `
            <p>Ви вирішили виростити щось гостріше за звичайний "Вогник"? Ласкаво просимо до клубу. Але перед тим, як покласти насіння у ґрунт, забудьте все, що знали про перці. Суперхоти грають за власними правилами!</p>

            <h3>1. Екзамен на витримку</h3>
            <p>Насіння суперхотів не проростає — воно медитує. Якщо звичайний перець вилітає за кілька днів, ці хлопці можуть сидіти в землі довше ніж ми звикли. На цьому етапі попіклуйтеся про хороший субстрат для перців. Він не має бути перегодований добривами.*</p>

            <h3>2. Фаза "Drama Queen"</h3>
            <p>На етапі перших справжніх листків починається справжній трилер. Ваша розсада стає неймовірно тендітною. Суперхоти зараз — справжні королеви драми 👑💅.</p>
            
            <div class="drama-queen-box">
                <strong>Важливо:</strong> Перелив і переохолодження на цьому етапі дорівнює смерті 💀. Зайва вода і протяг з вікна — і рослина гине за ніч.
            </div>

            <p>Критично поставити <strong>обдув</strong> 💨. Легкий вітерець від вентилятора імітує природу та зміцнює стовбур.</p>

            <h3>3. Пікіровка 🪴: Зона ризику</h3>
            <p>Суперхоти ненавидять, коли чіпають їхнє коріння. Кожна пересадка — стрес. Радимо садити одразу у стакани.</p>

            <h3>4. Світло в кінці тунелю</h3>
            <p>Коли з'являється другий сет справжніх листків, примхи вщухають. Рослина стає міцною день у день.</p>
        `,
        tags: ['поради', 'суперхоти', 'пікіровка', 'розсада']
    },

    {
        id: 'carolina-reaper-guide',
        title: 'Carolina Reaper: Повний гайд з вирощування',
        slug: 'carolina-reaper-guide',
        category: 'growing',
        categoryLabel: 'Вирощування',
        date: '2026-03-05',
        author: 'Gapka',
        readTime: '10 хв',
        image: 'Carolina-Reaper-Red-main.webp',
        featured: false,
        excerpt: 'Найгостріший перець у світі — Carolina Reaper. Детальний гайд як виростити його вдома від А до Я.',
        content: `
            <p>Carolina Reaper — це не просто перець. Це виклик, престиж, і 2.2 мільйона одиниць Сковілла болю та задоволення.</p>

            <h3>Що потрібно знати перед початком</h3>
            <ul>
                <li><strong>Термін дозрівання:</strong> 100-120 днів від посадки</li>
                <li><strong>Гострота:</strong> 2,200,000+ SHU</li>
                <li><strong>Висота рослини:</strong> 90-120 см</li>
                <li><strong>Вид:</strong> Capsicum Chinense</li>
            </ul>

            <h3>Крок 1: Проростання (7-14 днів)</h3>
            <p>Температура 26-30°C критична! Використовуйте нижній підігрів або розташуйте біля батареї.</p>

            <h3>Крок 2: Розсада</h3>
            <p>Підсвічування 12-16 годин на день в залежності від інтенсивності лампи. Особливо якщо Ви не маєте південного підвіконня і сильного сонячного світла, досвічування буде критично важливим. 

            <h3>Крок 3: Висадка (травень-червень)</h3>
            <p>Тільки після останніх заморозків! Reaper вимагає стабільно теплої погоди.</p>

            <h3>Крок 4: Догляд</h3>
            <p>Полив регулярний але помірний. Активне підживленя. Починайте з 1/4 від норми в інструкції з добривами. Підв'язка при висадці у грунт або контейнеп обов'язкова — плодів буде багато!</p>

            <blockquote>
                💡 <strong>Секрет від Gapka:</strong> За 2 тижні до збору врожаю зменшіть полив на 30% — це підвищить капсаїцин і гостроту!
            </blockquote>
        `,
        tags: ['carolina-reaper', 'гайд', 'chinense', 'суперхоти']
    },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // РЕЦЕПТИ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    //{
     //   id: 'habanero-sauce-recipe',
       // title: 'Класичний соус Habanero: Рецепт від Homestead',
     //   slug: 'habanero-sauce-recipe',
     //   category: 'recipes',
     //   categoryLabel: 'Рецепти',
     //   date: '2026-03-12',
     //   author: 'Gapka',
     //   readTime: '15 хв',
      //  image: 'images/habanero-sauce.jpg',
     //   featured: false,
     //   excerpt: 'Простий 6-інгредієнтний рецепт класичного гострого соусу Habanero. Вогняно, смачно, без консервантів.',
    //    content: `
    //        <h3>Інгредієнти:</h3>
    //        <ul>
    //            <li>15-20 шт. перець Habanero</li>
    //            <li>20 мл оливкова олія extra virgin</li>
     //           <li>2 зубчики часник</li>
    //            <li>120 мл яблучний оцет</li>
    //            <li>20 г білий цукор</li>
    //            <li>3 г сіль</li>
    //        </ul>
//
    //        <h3>Приготування:</h3>
    //        <ol>
    //            <li>Вимийте перці, видаліть плодоніжки</li>
    //            <li>Нагрійте олію на слабкому вогні</li>
    //            <li>Додайте перці, готуйте під кришкою 8 хвилин</li>
    //           <li>Додайте часник, готуйте ще 1-2 хвилини</li>
     //           <li>Влийте оцет, додайте цукор і сіль</li>
    //            <li>Тушкуйте 10 хвилин під кришкою</li>
    //            <li>Охолодіть 10 хвилин, збийте блендером до гладкості</li>
    //        </ol>

    //        <div class="warning-box">
    //            ⚠️ <strong>Безпека:</strong> Готування гострих перців виділяє пари! Використовуйте маску та відкрийте вікна.
     //       </div>
//
    //        <h3>Зберігання:</h3>
    //       <p>У холодильнику до 3+ місяців. Чим довше стоїть — тим смачніше!</p>
    //    `,
    //    tags: ['рецепт', 'habanero', 'соус', 'без-консервантів']
   // },


    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // НОВИНИ ФЕРМИ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   // {
   //     id: 'new-varieties-2026',
   //     title: 'Нові сорти весни 2026: Що висаджуємо вперше',
   //     slug: 'new-varieties-2026',
   //     category: 'news',
    //    categoryLabel: 'Новини',
   //     date: '2026-02-20',
   //     author: 'Gapka',
    //    readTime: '5 хв',
   //     image: 'images/new-varieties.jpg',
   //     featured: false,
   //     excerpt: 'Експерименти не закінчуються! Цього року тестуємо 5 нових екзотичних сортів суперхотів.',
    //    content: `
    //        <p>Кожен сезон ми пробуємо щось нове. Ось що висадили вперше цього року:</p>
//
    //        <h3>1. Chocolate Bhutlah</h3>
    //        <p>Темно-коричневий красень з пекельною гостротою 2M+ SHU. Кажуть, смакує як димний шоколад з вогнем.</p>
//
     //       <h3>2. 7 Pot Primo</h3>
    //        <p>Кузен Reaper'а з характерним "хвостиком". Гострота космічна — 1.5M SHU.</p>
//
     //       <h3>3. Sugar Rush Peach</h3>
    //        <p>Не суперхот, але цікавий! Персиковий колір, фруктовий смак, приємна гострота.</p>
//
     //       <h3>4. Jay's Peach Ghost Scorpion</h3>
    //        <p>Гібрид Ghost Pepper + Trinidad Scorpion. Персиковий, красивий, пекельний.</p>
//
     //       <h3>5. MOA Scotch Bonnet</h3>
      //      <p>Рідкісний Scotch Bonnet з Ямайки. Цитрусовий аромат, класична гострота.</p>
//
      //      <p>Слідкуйте за оновленнями — наприкінці літа зробимо повний огляд кожного сорту!</p>
      //  `,
    //    tags: ['новинки', 'сорти', 'експеримент', '2026']
   // },

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // СОРТИ ТА ОГЛЯДИ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        id: 'capsicum-chinense-guide',
        title: 'Capsicum Chinense: Королі суперхотів',
        slug: 'capsicum-chinense-guide',
        category: 'varieties',
        categoryLabel: 'Сорти',
        date: '2026-03-01',
        author: 'Gapka',
        readTime: '12 хв',
        image: 'images/chinense.jpg',
        featured: false,
        excerpt: 'Повний гайд по виду Capsicum Chinense — звідки береться найбільша гострота у світі перців.',
        content: `
            <p>Capsicum Chinense — це не просто вид перцю. Це цілий світ найгостріших сортів планети.</p>

            <h3>Характеристики виду:</h3>
            <ul>
                <li><strong>Гострота:</strong> 100,000 - 2,200,000+ SHU</li>
                <li><strong>Дозрівання:</strong> 90-120 днів</li>
                <li><strong>Висота:</strong> 80-150 см</li>
                <li><strong>Температура:</strong> 26-30°C для проростання</li>
            </ul>

            <h3>Найвідоміші представники:</h3>
            
            <h4>🏆 Carolina Reaper (2.2M+ SHU)</h4>
            <p>Чемпіон світу з гостроти. Морщинистий, з характерним "хвостиком".</p>

            <h4>👻 Ghost Pepper / Bhut Jolokia (1M SHU)</h4>
            <p>Легенда з Індії. Перший перець, що перевищив 1 мільйон SHU.</p>

            <h4>🦂 Trinidad Scorpion (1.2M-2M SHU)</h4>
            <p>З "жалом" скорпіона на кінчику. Пекельна гострота.</p>

            <h4>🌶️ Habanero (100K-350K SHU)</h4>
            <p>Класика. Фруктовий смак, помірна (для Chinense) гострота.</p>
        `,
        tags: ['chinense', 'види', 'superhots', 'гайд']
    },

    {
    id: 'homestead-inferno-collection-2026',
    title: 'Експедиція у Пекло: Повний огляд колекції перців 2026',
    slug: 'collection-2026-longread',
    category: 'varieties',
    categoryLabel: 'Колекція',
    date: '2026-03-16',
    author: 'Gapka',
    readTime: '15 хв',
    image: 'images/blog/main-collection-cover.jpg',
    featured: true,
    excerpt: '30+ сортів 200+ рослин. Великий путівник нашою вогняною плантацією: від легендарної Кароліни Ріпер до загадкового Рокото.',
    content: `
        <p>Ласкаво просимо до епіцентру подій. Сезон 2026 у <a href="index.html" class="main-logo-link"><strong>Gapka Homestead Inferno</strong></a> — це не просто город, це масштабне випробування генетики та фенотипів. Поки розсада завойовує підвіконня, ми розкладаємо наш арсенал по поличках.</p>

        <div class="intro-box" style="background: #272727; padding: 20px; border-radius: 10px; border-left: 5px solid #e02424;">
            <p><strong>Концепція сезону:</strong> Максимальна різноманітність. Ми поєднали чотири хвилі посадки, щоб перевірити, хто швидше захопить світ.</p>
        </div>

        <h2 style="color: #e02424; margin-top: 40px;">🧪 Дивізіон "Ядерна зима": Суперхоти (1M+ SHU)</h2>
        <p>Це еліта, яка не пробачає помилок. Вони ростуть повільно, але б'ють наповал.</p>

        <div class="variety-card">
            <h4>Carolina Reaper (Red & Chocolate)</h4>
            <img src="images/peppers/reaper-main.jpg" alt="Carolina Reaper" class="article-img" />
            <p>Наш флагман. Ми вирощуємо класичну червону та елегантну шоколадну версії.<a href="product.html?id=carolinareaperchocolate" class="link-to-product"> <strong>Carolina Reaper Chocolate</strong></a>  зазвичай має більш "важкий" аромат і підступну гостроту, що накочує хвилями.</p>
        </div>

        <div class="variety-card">
            <h4>Гвардія 7 Pot: Brain Strain & Bubblegum</h4>
            <img src="images/peppers/7pot-family.jpg" alt="7 Pot Peppers" class="article-img" />
            <p><a href="product.html?id=7PotBrainStrainYellow" class="link-to-product"> <strong>7 Pot Brain Strain (Red | Yellow)</strong></a> — перці з поверхнею, що нагадує розпечений мозок. Поруч із ними — екзотичний <a href="product.html?id=7potbubblegumchocolate" class="link-to-product"> <strong>Bubblegum Chocolate</strong></a>, знаменитий своєю кольоровою чашечкою, що забарвлюється в тон плоду.</p>
        </div>

        <div class="variety-card">
            <h4>Naga Bhut Jolokia & Scorpion</h4>
            <img src="images/peppers/naga-ghost.jpg" alt="Ghost Peppers" class="article-img" />
            <p>Класика жанру. У списку — класичний <a href="product.html?id=bhutjolokiared" class="link-to-product"> <strong>Bhut Jolokia</strong></a>, <a href="product.html?id=nagajolokia" class="link-to-product"> <strong>Naga Bhut Jolokia</strong></a> та <a href="product.html?id=morugascorpionred" class="link-to-product"> <strong>Moruga Scorpion</strong></a>. Ці сорти — фундамент для наших найгостріших соусів.</p>
        </div>

        <h2 style="color: #d97706; margin-top: 40px;">🥭 Дивізіон "Тропічний шторм": Habanero & Scotch Bonnet</h2>
        <p>Тут панують аромати манго, цитруса та абрикоса, приправлені солідним вогнем.</p>

        <div class="variety-card">
            <h4>Habanero Clan</h4>
            <img src="images/peppers/habanero-grid.jpg" alt="Habanero Collection" class="article-img" />
            <p>У нас справжній пантеон Хабанеро:<a href="product.html?id=habaneroredsavina" class="link-to-product"> <strong>Savina Red</strong></a> (екс-рекордсмен), <a href="product.html?id=habanerochocolate" class="link-to-product"><strong>Chocolate</strong></a>, <a href="product.html?id=habanerodominica" class="link-to-product"><strong>Dominica</strong></a> та яскравий <a href="product.html?id=habanerobigsun" class="link-to-product"><strong>Big Sun</strong></a>. Кожен має свій відтінок фруктових нот.</p>
        </div>

        <div class="variety-card">
            <h4>Scotch Bonnet & Fatalii</h4>
            <img src="images/peppers/caribbean-vibe.jpg" alt="Scotch Bonnet and Fatalii" class="article-img" />
            <p>Ямайська душа нашого городу. Два види <a href="product.html?id=scotchbonnet" class="link-to-product"><strong>Scotch Bonnet</strong></a> та десант <a href="product.html?id=fatalii" class="link-to-product"><strong>Fatalii</strong></a> (Yellow, Red). Фаталі — це лимонна блискавка, яка б'є миттєво.</p>
        </div>

        <h2 style="color: #059669; margin-top: 40px;">🎨 Дивізіон "Естетика та Екзотика": Baccatum & Pubescens</h2>
        <p>Перці для тих, хто цінує не лише гостроту, а й красу куща та унікальний смак.</p>

        <div class="variety-card">
            <h4>Giant Rocoto</h4>
            <img src="images/peppers/giant-rocoto.jpg" alt="Giant Rocoto" class="article-img" />
            <p>Зірка партії. Чорне насіння, фіолетові квіти та товсті соковиті стінки.<a href="product.html?id=giantrocotored" class="link-to-product"><strong> Rocoto</strong></a> — це перець-довгожитель, який обожнює прохолоду і ненавидить спеку, зовсім як ми!.</p>
        </div>

        <div class="variety-card">
            <h4>Baccatum Beauty: Zebrange & Sugar Rush</h4>
            <img src="images/peppers/zebrange-sugar.jpg" alt="Baccatum peppers" class="article-img" />
            <p><a href="product.html?id=sugarrushstripey" class="link-to-product"><strong>Sugar Rush</strong></a> (Полосатий цукор) та смугастий <a href="product.html?id=zebrange" class="link-to-product"><strong>Zebrange</strong></a> — головні "моделі" для фотосесій. Вони солодкі, ароматні та неймовірно врожайні.</p>
        </div>

        <div class="variety-card">
            <h4>Monkey Face & Aji Melocoton</h4>
            <img src="images/peppers/funky-shapes.jpg" alt="Monkey Face Pepper" class="article-img" />
            <p>Сорти з характером. <a href="product.html?id=monkeyfaceyellow" class="link-to-product"><strong>Monkey Face</strong></a> дивує формою, а <a href="product.html?id=ajimelocoton" class="link-to-product"><strong>Aji Melocoton</strong></a> дарує ніжний персиковий смак та делікатну гостроту.</p>
        </div>

        <h2 style="color: #2563eb; margin-top: 40px;">🍕 Дивізіон "Кухонний Спецназ": Класика гриля</h2>
        <p>Те, що робить щоденну їжу яскравішою. Робочі конячки плантації.</p>
        <ul>
            <li><strong><a href="product.html?id=jalapeno" class="link-to-product">Jalapeno</a> :</strong> Король маринування та "попперсів".</li>
            <li><strong><a href="product.html?id=padron" class="link-to-product">Padron</a></strong>  & <strong><a href="product.html?id=shishito" class="link-to-product">Shishito</a>:</strong> Ідеальні для швидкої обсмажки на олії з сіллю.</li>
            <li><strong><a href="product.html?id=lemondrop" class="link-to-product">Lemon Drop</a></strong>  & <strong><a href="product.html?id=starfishred" class="link-to-product">Brazilian Starfish</a>:</strong> Цитрусові нотки для салатів та риби.</li>
            <li><strong><a href="product.html?id=peterpepper" class="link-to-product">Peter Pepper</a> :</strong> Перець, який завжди викликає посмішку завдяки своїй анатомічній формі.</li>
            <li><strong><a href="product.html?id=anchosanluis" class="link-to-product">Ancho San Luis</a> :</strong> Великі, м'ясисті плоди для фарширування та сушіння.</li>
        </ul>

        <div class="outro-box" style="margin-top: 50px; padding: 30px; background: #262626; color: white; border-radius: 10px;">
            <h3>Епілог: Що далі?</h3>
            <p>Зараз уся ця армада проходить випробування південним вікном. Попереду — переїзд у теплицю-термос, де ми побачимо справжню силу методу "Pepper Guru" у поєднанні з нашою українською впертістю. 300+ кущів чекають на свій час.</p>
            <p><strong>Далі буде... Готуйте молоко!</strong></p>
        </div>
    `,
    tags: ['арсенал 2026', 'суперхоти', 'хабанеро', 'рокото', 'вирощування', 'homestead-inferno']
},

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ПОРАДИ ТА ЛАЙФХАКИ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    {
        id: 'winter-growing-tips',
        title: 'Вирощування перців взимку: 5 правил успіху',
        slug: 'winter-growing-tips',
        category: 'tips',
        categoryLabel: 'Поради',
        date: '2026-01-25',
        author: 'Gapka',
        readTime: '6 хв',
        image: 'images/winter-growing.jpg',
        featured: false,
        excerpt: 'Взимку можна! Але потрібно знати нюанси. Ділимося секретами зимового вирощування суперхотів.',
        content: `
            <p>Хто сказав, що перці — тільки літня культура? З правильним підходом врожай можливий цілий рік!</p>

            <h3>Правило 1: Світло — все!</h3>
            <p>Фітолампи 16 годин на день. Без компромісів! Зимове сонце не дасть потрібної кількості світла.</p>

            <h3>Правило 2: Тепло критично</h3>
            <p>Мінімум +22°C вдень, +18°C вночі. Використовуйте підігрів горщиків або тепловий килимок.</p>

            <h3>Правило 3: Вологість повітря</h3>
            <p>Батареї сушать повітря. Зволожувач або тазик з водою поруч — must have!</p>

            <h3>Правило 4: Обережно з поливом</h3>
            <p>Взимку ріст сповільнений — води потрібно менше. Перелив = гниття коренів.</p>

            <h3>Правило 5: Підживлення</h3>
            <p>Регулярне але помірне.</p>

            <blockquote>
                💡 Бонус: Перці-багаторічники (ідеальні кандидати - Capsicum pubescens) можна заносити додому на зиму. Вони переживуть і будуть плодоносити знову!</blockquote>
        `,
        tags: ['зима', 'підсвічування', 'поради', 'indoor']
    },

    {
        id: 'seed-germination-hacks',
        title: 'Лайфхаки для 90%+ схожості насіння',
        slug: 'seed-germination-hacks',
        category: 'tips',
        categoryLabel: 'Поради',
        date: '2026-01-15',
        author: 'Gapka',
        readTime: '8 хв',
        image: 'images/germination.jpg',
        featured: false,
        excerpt: 'Насіння не проростає? Ці трюки підвищать схожість навіть найкапризніших суперхотів.',
        content: `
            <p>Схожість суперхотів — больове питання. Ось декілька перевірених способів підвищити її до максимуму:</p>

            <h3>1. Paper Towel метод. Або метод вологої серветки</h3>
            <p>Візміть звичайні паперові серветки та намочіть гарячою водою. Дайте воді стекти, щоб з серветок не текло, але вони були вологі. Викладіть в них насіння і положіть у пластиковий контейнер, закривши кришкою і поставивши у тепле місце (на роутер). Провітрюйте раз в на день і не допускайте пересушування. Сходи будуть на 5+ день залежно від сорту.</p>

            <h3>2. Підігрів знизу</h3>
            <p>Тепловий килимок під горщики або батарея поруч. +26-30°C обов'язково!</p>

            <h3>3. Міні-теплиця</h3>
            <p>Плівка або пакет зверху горщика = 100% вологість. Але провітрюйте щодня!</p>

            <h3>4. Свіже насіння завжди краще</h3>
            <p>1-2 роки зберігання = топ схожість. 5+ років = лотерея.</p>

            <h3>5. Торф'яні таблетки</h3>
            <p>Якщо не хочете бруднитися в землі - цей варіант для Вас. Просто додайте теплої води!</p>

            <h3>6. Не закопуйте глибоко</h3>
            <p>Положіть насінинку у ямку, зроблену Вашим пальчиком, і злегка притрусіть грунтом зверху. Все! Заглиблювати не потрібно.</p>

            <div class="tip-box">
                💡 <strong>Гарантований спосіб:</strong> Комбінуйте кілька методів. Наприклад: підігрів + міні-теплиця = 90%+ схожості!
            </div>
        `,
        tags: ['проростання', 'лайфхаки', 'насіння', 'поради']
    }
];

// Експортуємо для використання
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { blogPosts };
}
