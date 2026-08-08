// DoJG-inspired grammar points with cloze deletion sentences
// Structure: show sentence with grammar blank → student fills in → reveal + explanation

export interface GrammarExample {
  jp: string         // Full sentence
  cloze: string      // The grammar part to blank (exact substring of jp)
  en: string         // English translation
}

export interface GrammarPoint {
  id: string
  pattern: string       // e.g. "〜は〜です"
  english: string       // e.g. "A is B (copula)"
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  explanation: string
  hint: string          // Short hint shown after first wrong attempt
  examples: GrammarExample[]
}

export const GRAMMAR_DATA: GrammarPoint[] = [
  // ==================== N5 ====================
  {
    id: 'g001', pattern: '〜は〜です', english: 'A is B (topic marker + copula)',
    level: 'N5',
    explanation: 'は (wa) marks the topic of the sentence. です (desu) is the polite copula meaning "is/am/are". Together they form the basic "A is B" structure.',
    hint: 'Topic marker + copula. Written as は but read as "wa".',
    examples: [
      { jp: '私は学生です。', cloze: 'は', en: 'I am a student.' },
      { jp: 'これはペンです。', cloze: 'は', en: 'This is a pen.' },
      { jp: 'あの人は先生です。', cloze: 'は', en: 'That person is a teacher.' },
    ],
  },
  {
    id: 'g002', pattern: '〜ではありません / じゃないです', english: 'A is not B (negative copula)',
    level: 'N5',
    explanation: 'じゃないです (informal) or ではありません (formal) negates です. Use to say something is NOT something.',
    hint: 'Informal negative: じゃない. Formal: ではありません.',
    examples: [
      { jp: '私は学生じゃないです。', cloze: 'じゃないです', en: 'I am not a student.' },
      { jp: 'これはペンではありません。', cloze: 'ではありません', en: 'This is not a pen.' },
      { jp: '田中さんは日本人じゃないです。', cloze: 'じゃないです', en: 'Mr. Tanaka is not Japanese.' },
    ],
  },
  {
    id: 'g003', pattern: '〜を〜', english: 'Object marker を (wo)',
    level: 'N5',
    explanation: 'を (wo) marks the direct object of a verb — the thing that receives the action. It\'s written を but usually pronounced "o".',
    hint: 'Marks the direct object. Pronounced "o".',
    examples: [
      { jp: 'ごはんを食べます。', cloze: 'を', en: 'I eat rice.' },
      { jp: '本を読みます。', cloze: 'を', en: 'I read a book.' },
      { jp: '音楽を聴きます。', cloze: 'を', en: 'I listen to music.' },
    ],
  },
  {
    id: 'g004', pattern: '〜に行く / 来る', english: 'Go/come TO a place (に for destination)',
    level: 'N5',
    explanation: 'に (ni) marks the destination when used with movement verbs like 行く (iku, go), 来る (kuru, come), 帰る (kaeru, return). Think of it as "towards".',
    hint: 'Direction/destination marker with movement verbs.',
    examples: [
      { jp: '学校に行きます。', cloze: 'に', en: 'I go to school.' },
      { jp: '家に帰ります。', cloze: 'に', en: 'I return home.' },
      { jp: '日本に来ました。', cloze: 'に', en: 'I came to Japan.' },
    ],
  },
  {
    id: 'g005', pattern: '〜で〜する', english: 'Do something AT a location (で for action location)',
    level: 'N5',
    explanation: 'で (de) marks where an action takes place. Different from に which marks destination — で marks the scene of the action.',
    hint: 'Where the action happens. Compare: に = going TO, で = doing AT.',
    examples: [
      { jp: '図書館で本を読みます。', cloze: 'で', en: 'I read books at the library.' },
      { jp: 'レストランで食べました。', cloze: 'で', en: 'I ate at a restaurant.' },
      { jp: '公園でサッカーをします。', cloze: 'で', en: 'I play soccer at the park.' },
    ],
  },
  {
    id: 'g006', pattern: '〜も', english: 'Also / too (も)',
    level: 'N5',
    explanation: 'も (mo) replaces は or が to mean "also" or "too". It adds the new item to a group already being discussed.',
    hint: 'Replaces は/が. Means "also/too".',
    examples: [
      { jp: '私も学生です。', cloze: 'も', en: 'I am also a student.' },
      { jp: 'コーヒーも好きです。', cloze: 'も', en: 'I also like coffee.' },
      { jp: '彼女も来ます。', cloze: 'も', en: 'She is coming too.' },
    ],
  },
  {
    id: 'g007', pattern: '〜と〜', english: 'A and B / with A (と)',
    level: 'N5',
    explanation: 'と (to) connects two nouns meaning "and" or "with". Unlike や, と is exhaustive — it lists all items.',
    hint: 'Connects nouns: "A and B" or "with A".',
    examples: [
      { jp: '肉と野菜を食べます。', cloze: 'と', en: 'I eat meat and vegetables.' },
      { jp: '友達と映画を見ました。', cloze: 'と', en: 'I watched a movie with a friend.' },
      { jp: '母と父と買い物に行きます。', cloze: 'と', en: 'I\'m going shopping with my mom and dad.' },
    ],
  },
  {
    id: 'g008', pattern: '〜たい', english: 'Want to ~ (desire)',
    level: 'N5',
    explanation: 'たい attaches to the verb stem (drop ます) to express desire. It works like an i-adjective: たくない (don\'t want to), たかった (wanted to).',
    hint: 'Verb stem + たい = "want to verb". Acts like an i-adjective.',
    examples: [
      { jp: '日本に行きたいです。', cloze: 'たい', en: 'I want to go to Japan.' },
      { jp: 'すしを食べたいです。', cloze: 'たい', en: 'I want to eat sushi.' },
      { jp: '日本語を話したい。', cloze: 'たい', en: 'I want to speak Japanese.' },
    ],
  },
  {
    id: 'g009', pattern: '〜ている', english: 'Is doing ~ / ongoing state (〜ている)',
    level: 'N5',
    explanation: 'て-form + いる expresses: (1) an ongoing action right now (progressive), or (2) a resulting state. "食べている" = is eating. "結婚している" = is married (state).',
    hint: 'て-form + いる. Progressive OR resulting state.',
    examples: [
      { jp: '今、ごはんを食べています。', cloze: 'ています', en: 'I am eating right now.' },
      { jp: '雨が降っています。', cloze: 'ています', en: 'It is raining.' },
      { jp: '彼は日本語を勉強しています。', cloze: 'ています', en: 'He is studying Japanese.' },
    ],
  },
  {
    id: 'g010', pattern: '〜てください', english: 'Please do ~ (request)',
    level: 'N5',
    explanation: 'て-form + ください makes a polite request. More direct than ~ませんか (invitation). Used for instructions, directions, and polite commands.',
    hint: 'て-form + ください = polite request/instruction.',
    examples: [
      { jp: 'ゆっくり話してください。', cloze: 'てください', en: 'Please speak slowly.' },
      { jp: 'ここに名前を書いてください。', cloze: 'てください', en: 'Please write your name here.' },
      { jp: '待ってください！', cloze: 'てください', en: 'Please wait!' },
    ],
  },
  {
    id: 'g011', pattern: '〜ませんか', english: 'Won\'t you ~? / Shall we ~? (invitation)',
    level: 'N5',
    explanation: '〜ませんか is a polite invitation meaning "Won\'t you...?" or "Would you like to...?" It\'s softer than 〜ましょう and gives the other person the option to decline.',
    hint: 'Polite invitation. Softer than ましょう.',
    examples: [
      { jp: '一緒に映画を見ませんか？', cloze: 'ませんか', en: 'Won\'t you watch a movie with me?' },
      { jp: 'コーヒーを飲みませんか？', cloze: 'ませんか', en: 'Would you like to drink coffee?' },
      { jp: '公園に行きませんか？', cloze: 'ませんか', en: 'Shall we go to the park?' },
    ],
  },
  {
    id: 'g012', pattern: '〜ましょう', english: 'Let\'s ~ (suggestion)',
    level: 'N5',
    explanation: '〜ましょう is a first-person plural suggestion meaning "Let\'s...". It\'s more assertive than 〜ませんか. Can also be used to respond to an invitation.',
    hint: 'Replace ます with ましょう. "Let\'s verb together."',
    examples: [
      { jp: '昼ごはんを食べましょう。', cloze: 'ましょう', en: 'Let\'s eat lunch.' },
      { jp: '一緒に勉強しましょう！', cloze: 'ましょう', en: 'Let\'s study together!' },
      { jp: '日本語で話しましょう。', cloze: 'ましょう', en: 'Let\'s speak in Japanese.' },
    ],
  },
  {
    id: 'g013', pattern: '〜から', english: 'Because ~ / From ~ (から)',
    level: 'N5',
    explanation: 'から has two uses: (1) reason/cause "because" — placed after the reason clause; (2) starting point "from" (place or time). Context makes it clear which is intended.',
    hint: 'Two uses: "because" (reason) or "from" (starting point).',
    examples: [
      { jp: '眠いから、寝ます。', cloze: 'から', en: 'I\'m sleepy, so I\'ll sleep.' },
      { jp: '学校から家まで歩きます。', cloze: 'から', en: 'I walk from school to home.' },
      { jp: '九時から仕事が始まります。', cloze: 'から', en: 'Work starts from nine o\'clock.' },
    ],
  },
  {
    id: 'g014', pattern: '〜が好きです / 嫌いです', english: 'Like / Dislike (が好き / が嫌い)',
    level: 'N5',
    explanation: 'Like/dislike uses が not を. The thing liked/disliked is marked with が. 大好き (daisuki) = love, 好き (suki) = like, 嫌い (kirai) = dislike.',
    hint: 'Use が (not を) with 好き/嫌い.',
    examples: [
      { jp: '日本語が好きです。', cloze: 'が', en: 'I like Japanese.' },
      { jp: '犬が大好きです！', cloze: 'が', en: 'I love dogs!' },
      { jp: '辛い食べ物が嫌いです。', cloze: 'が', en: 'I dislike spicy food.' },
    ],
  },
  {
    id: 'g015', pattern: '〜のが好き / 上手', english: 'Like doing ~ / Good at doing ~ (verb の)',
    level: 'N5',
    explanation: 'の nominalizes a verb phrase (turns it into a noun). 食べるの = "eating". Then you can attach 好き, 上手, 下手, etc. to the nominalized verb.',
    hint: 'Verb dictionary form + の = the act of verbing.',
    examples: [
      { jp: '本を読むのが好きです。', cloze: 'の', en: 'I like reading books.' },
      { jp: '料理を作るのが上手です。', cloze: 'の', en: 'I\'m good at cooking.' },
      { jp: '歌を歌うのが大好きです。', cloze: 'の', en: 'I love singing songs.' },
    ],
  },
  {
    id: 'g016', pattern: '〜ことができる', english: 'Can do ~ / Be able to ~ (ability)',
    level: 'N5',
    explanation: 'Dictionary form + ことができる expresses ability or possibility. Alternative: use the potential form of the verb (食べられる, 話せる). Both are natural.',
    hint: 'Dictionary form + ことができる. Can also use potential verb form.',
    examples: [
      { jp: '日本語を話すことができます。', cloze: 'ことができます', en: 'I am able to speak Japanese.' },
      { jp: '車を運転することができません。', cloze: 'ことができません', en: 'I cannot drive a car.' },
      { jp: '泳ぐことができますか？', cloze: 'ことができます', en: 'Can you swim?' },
    ],
  },
  {
    id: 'g017', pattern: '〜てもいいですか', english: 'May I ~? / Is it okay to ~?',
    level: 'N5',
    explanation: 'て-form + もいいです means "it\'s okay to do ~". As a question (もいいですか?), it\'s asking for permission. Reply: はい、〜てもいいです (yes) or いいえ、〜てはいけません (no).',
    hint: 'Asking permission. て-form + もいいですか。',
    examples: [
      { jp: '写真を撮ってもいいですか？', cloze: 'てもいいですか', en: 'May I take a photo?' },
      { jp: 'ここに座ってもいいですか？', cloze: 'てもいいですか', en: 'Is it okay if I sit here?' },
      { jp: 'トイレに行ってもいいですか？', cloze: 'てもいいですか', en: 'May I go to the bathroom?' },
    ],
  },
  {
    id: 'g018', pattern: '〜なければなりません', english: 'Must do ~ / Have to ~ (obligation)',
    level: 'N5',
    explanation: 'ない-form → change ない to なければ + ならない = "must do". Casual: なきゃ. Negative (don\'t have to): なくてもいいです.',
    hint: 'Negative base + ければならない. Casual: なきゃ.',
    examples: [
      { jp: '宿題をしなければなりません。', cloze: 'なければなりません', en: 'I must do my homework.' },
      { jp: '明日早く起きなければなりません。', cloze: 'なければなりません', en: 'I have to wake up early tomorrow.' },
      { jp: '薬を飲まなければなりません。', cloze: 'なければなりません', en: 'I must take medicine.' },
    ],
  },
  {
    id: 'g019', pattern: '〜たことがある', english: 'Have done ~ before (experience)',
    level: 'N4',
    explanation: 'Past tense (た-form) + ことがある expresses having the experience of doing something. It\'s about whether you\'ve done it at some point in your life, not recently.',
    hint: 'た-form + ことがある = have the experience of having done.',
    examples: [
      { jp: '日本に行ったことがあります。', cloze: 'たことがあります', en: 'I have been to Japan (before).' },
      { jp: 'すしを作ったことがありますか？', cloze: 'たことがありますか', en: 'Have you ever made sushi?' },
      { jp: '富士山に登ったことがありません。', cloze: 'たことがありません', en: 'I have never climbed Mt. Fuji.' },
    ],
  },
  {
    id: 'g020', pattern: 'AよりBのほうが〜', english: 'B is more ~ than A (comparison)',
    level: 'N4',
    explanation: 'より (yori) = "than". The structure is always: [lesser thing] より [greater thing] のほうが [adjective]. The thing after より is the baseline being compared against.',
    hint: 'X より Y のほうが = Y is more [adj] than X.',
    examples: [
      { jp: '電車よりバスのほうが遅いです。', cloze: 'より', en: 'The bus is slower than the train.' },
      { jp: '夏より冬のほうが好きです。', cloze: 'より', en: 'I prefer winter over summer.' },
      { jp: 'コーヒーより紅茶のほうがおいしいです。', cloze: 'より', en: 'Tea is tastier than coffee.' },
    ],
  },
  {
    id: 'g021', pattern: '〜すぎる', english: 'Too much ~ / Excessively ~ (すぎる)',
    level: 'N4',
    explanation: 'すぎる attaches to: adjective stem (大き → 大きすぎる "too big"), i-adjective drop い (高 → 高すぎる "too expensive"), or verb stem (食べ → 食べすぎる "eat too much").',
    hint: 'Attach すぎる to adjective stem or verb stem.',
    examples: [
      { jp: 'このラーメンは辛すぎます。', cloze: 'すぎます', en: 'This ramen is too spicy.' },
      { jp: '昨日、食べすぎました。', cloze: 'すぎました', en: 'I ate too much yesterday.' },
      { jp: 'その映画は長すぎて、眠くなりました。', cloze: 'すぎて', en: 'That movie was too long and I got sleepy.' },
    ],
  },
  {
    id: 'g022', pattern: '〜前に / 〜後で', english: 'Before ~ / After ~ (time ordering)',
    level: 'N4',
    explanation: '前に (mae ni) = "before doing". 後で (ato de) = "after doing". With verbs: dictionary form + 前に, た-form + 後で. With nouns: noun + の前に / の後で.',
    hint: 'Dictionary form + 前に. た-form + 後で.',
    examples: [
      { jp: '寝る前に歯を磨きます。', cloze: '前に', en: 'I brush my teeth before sleeping.' },
      { jp: '食べた後で、散歩します。', cloze: '後で', en: 'After eating, I take a walk.' },
      { jp: '授業の前にコーヒーを飲みます。', cloze: '前に', en: 'I drink coffee before class.' },
    ],
  },
  {
    id: 'g023', pattern: '〜ながら', english: 'While doing ~ simultaneously (ながら)',
    level: 'N4',
    explanation: 'Verb stem + ながら means doing two things simultaneously. The main action comes after ながら. The subject must be the same for both actions.',
    hint: 'Verb stem + ながら. Same subject does both actions at once.',
    examples: [
      { jp: '音楽を聴きながら勉強します。', cloze: 'ながら', en: 'I study while listening to music.' },
      { jp: 'スマホを見ながら歩くのは危ないです。', cloze: 'ながら', en: 'Walking while looking at your phone is dangerous.' },
      { jp: 'コーヒーを飲みながら話しましょう。', cloze: 'ながら', en: 'Let\'s talk over coffee.' },
    ],
  },
  {
    id: 'g024', pattern: '〜んです / んですが', english: 'Explanatory の/ん (explanation/reason)',
    level: 'N4',
    explanation: 'のです (or んです in speech) adds an explanatory nuance — "the thing is...", "it\'s that...". 〜んですが softens a statement and implies a follow-up (like "the thing is..." leaving something unsaid).',
    hint: 'Adds "the reason is / the fact is" nuance. Very common in natural speech.',
    examples: [
      { jp: '頭が痛いんです。', cloze: 'んです', en: 'The thing is, I have a headache.' },
      { jp: '実は、日本語を勉強しているんです。', cloze: 'んです', en: 'Actually, I\'m studying Japanese.' },
      { jp: 'ちょっと聞きたいんですが...', cloze: 'んですが', en: 'The thing is, I wanted to ask you something...' },
    ],
  },
  {
    id: 'g025', pattern: '〜てしまう', english: 'End up doing ~ / regrettably did ~ (しまう)',
    level: 'N4',
    explanation: 'て-form + しまう means an action was completed, often with a nuance of: (1) it\'s fully done, or (2) it happened regrettably/unintentionally. Casual: 〜ちゃう/〜じゃう.',
    hint: 'Completion, often with regret. Casual: ちゃう.',
    examples: [
      { jp: '宿題を忘れてしまいました。', cloze: 'てしまいました', en: 'I ended up forgetting my homework.' },
      { jp: 'ケーキを全部食べてしまった。', cloze: 'てしまった', en: 'I ate up all the cake (oops).' },
      { jp: '傘を電車に置いてきてしまいました。', cloze: 'てしまいました', en: 'I went and left my umbrella on the train.' },
    ],
  },
  {
    id: 'g026', pattern: '〜でしょう', english: 'probably; I suppose (conjecture)',
    level: 'N5',
    explanation: 'でしょう expresses conjecture or seeks confirmation from the listener. It follows plain forms, nouns, or adjectives.',
    hint: 'Soft conjecture: \'probably\' or \'I suppose\'.',
    examples: [
    { jp: '明日は雨でしょう。', cloze: 'でしょう', en: 'It will probably rain tomorrow.' },
    { jp: '彼は学生でしょうか。', cloze: 'でしょうか', en: 'He is probably a student, right?' },
    { jp: 'もう終わったでしょう。', cloze: 'でしょう', en: 'It\'s probably finished already.' },
    ],
  },
  {
    id: 'g027', pattern: '〜けど / 〜が (soft contrast)', english: 'but; although; however (soft contrast or lead-in)',
    level: 'N5',
    explanation: 'けど (casual) and が (polite) connect two clauses with a soft contrast or serve as a gentle lead-in before making a request or statement.',
    hint: 'Soft \'but\'; also used as a polite lead-in.',
    examples: [
    { jp: '行きたいけど、時間がありません。', cloze: 'けど', en: 'I want to go, but I don\'t have time.' },
    { jp: 'すみませんが、駅はどこですか。', cloze: 'が', en: 'Excuse me, but where is the station?' },
    { jp: 'おいしいけど、高いですね。', cloze: 'けど', en: 'It\'s delicious, but it\'s expensive, isn\'t it.' },
    ],
  },
  {
    id: 'g028', pattern: '〜だから', english: 'so; therefore; that\'s why (casual reason)',
    level: 'N5',
    explanation: 'だから states a reason or cause in casual speech, meaning \'that is why\' or \'so\'. It follows a plain-form clause or sentence.',
    hint: 'Casual \'so\' / \'that\'s why\'.',
    examples: [
    { jp: '雨だから、傘を持っていきます。', cloze: 'だから', en: 'It\'s raining, so I\'ll take an umbrella.' },
    { jp: '眠いだから、早く寝ます。', cloze: 'だから', en: 'I\'m sleepy, so I\'ll go to bed early.' },
    { jp: '好きじゃないだから、食べません。', cloze: 'だから', en: 'I don\'t like it, so I won\'t eat it.' },
    ],
  },
  {
    id: 'g029', pattern: '〜ので', english: 'because; since (polite reason)',
    level: 'N5',
    explanation: 'ので gives a reason or cause in a polite, objective tone. It follows the plain form of verbs and adjectives, or noun/na-adjective + な.',
    hint: 'Polite \'because\'; softer than から.',
    examples: [
    { jp: '雨が降っているので、出かけません。', cloze: 'ので', en: 'Because it\'s raining, I won\'t go out.' },
    { jp: '具合が悪いので、早退してもいいですか。', cloze: 'ので', en: 'Because I feel sick, may I leave early?' },
    { jp: '静かなので、よく眠れます。', cloze: 'ので', en: 'Because it\'s quiet, I can sleep well.' },
    ],
  },
  {
    id: 'g030', pattern: '〜とき', english: 'when; at the time of',
    level: 'N5',
    explanation: 'とき means \'when\' and expresses a point in time or situation. It follows plain-form verbs, い-adjectives, な-adjective + な, or noun + の.',
    hint: '\'When ~\' — a point in time.',
    examples: [
    { jp: '子どものとき、よく泳ぎました。', cloze: 'とき', en: 'When I was a child, I often swam.' },
    { jp: '暇なとき、本を読みます。', cloze: 'とき', en: 'When I\'m free, I read books.' },
    { jp: '日本に来たとき、富士山を見ました。', cloze: 'とき', en: 'When I came to Japan, I saw Mt. Fuji.' },
    ],
  },
  {
    id: 'g031', pattern: 'どんな〜', english: 'what kind of; what sort of',
    level: 'N5',
    explanation: 'どんな is an interrogative adjective meaning \'what kind of\'. It directly precedes a noun and asks about the nature or type of something.',
    hint: '\'What kind of ~?\'',
    examples: [
    { jp: 'どんな音楽が好きですか。', cloze: 'どんな', en: 'What kind of music do you like?' },
    { jp: 'どんな人と話しましたか。', cloze: 'どんな', en: 'What kind of person did you talk with?' },
    { jp: 'どんな料理が得意ですか。', cloze: 'どんな', en: 'What kind of cooking are you good at?' },
    ],
  },
  {
    id: 'g032', pattern: 'どのくらい', english: 'how long; how much; how far (degree/extent)',
    level: 'N5',
    explanation: 'どのくらい (also どれくらい) asks about extent, duration, distance, or amount. It can modify a verb directly or be used with a noun.',
    hint: 'Asks about degree, duration, or amount.',
    examples: [
    { jp: '駅までどのくらいかかりますか。', cloze: 'どのくらい', en: 'How long does it take to the station?' },
    { jp: '日本語をどのくらい勉強しましたか。', cloze: 'どのくらい', en: 'How long have you studied Japanese?' },
    { jp: 'このかばんはどのくらいしますか。', cloze: 'どのくらい', en: 'How much does this bag cost?' },
    ],
  },
  {
    id: 'g033', pattern: '〜て〜て (te-form chaining)', english: '~, and then ~ (sequential actions)',
    level: 'N5',
    explanation: 'The te-form of a verb connects sequential or parallel actions, like \'and then\' in English. Multiple actions are chained by converting each verb to its te-form.',
    hint: 'Chain actions: \'do X, then do Y\'.',
    examples: [
    { jp: '朝ごはんを食べて、学校に行きます。', cloze: '食べて', en: 'I eat breakfast and then go to school.' },
    { jp: 'シャワーを浴びて、服を着ました。', cloze: '浴びて', en: 'I took a shower and then got dressed.' },
    { jp: '図書館で本を借りて、家で読みました。', cloze: '借りて', en: 'I borrowed a book from the library and read it at home.' },
    ],
  },
  {
    id: 'g034', pattern: '〜てあげる', english: 'to do something for someone (speaker does favor for other)',
    level: 'N4',
    explanation: 'てあげる expresses that the subject does a favor for someone else. It implies the action benefits the receiver, who is of equal or lower status.',
    hint: 'I do a favor FOR someone else.',
    examples: [
    { jp: '友達に本を貸してあげました。', cloze: 'てあげました', en: 'I lent a book to my friend (as a favor).' },
    { jp: '弟に宿題を教えてあげます。', cloze: 'てあげます', en: 'I\'ll help my younger brother with his homework.' },
    { jp: '荷物を持ってあげましょうか。', cloze: 'てあげましょうか', en: 'Shall I carry your luggage for you?' },
    ],
  },
  {
    id: 'g035', pattern: '〜てもらう', english: 'to receive the favor of someone doing something',
    level: 'N4',
    explanation: 'てもらう means the subject receives a benefit from someone else\'s action. The person who performs the action is marked with に.',
    hint: 'I receive a favor FROM someone.',
    examples: [
    { jp: '先生に漢字を教えてもらいました。', cloze: 'てもらいました', en: 'I had my teacher teach me kanji.' },
    { jp: '友達に写真を撮ってもらいました。', cloze: 'てもらいました', en: 'I had my friend take a photo for me.' },
    { jp: '医者に診てもらいます。', cloze: 'てもらいます', en: 'I will have the doctor examine me.' },
    ],
  },
  {
    id: 'g036', pattern: '〜てくれる', english: 'to do something for me (someone does a favor for the speaker)',
    level: 'N4',
    explanation: 'てくれる means someone does something for the benefit of the speaker (or someone in the speaker\'s in-group). It emphasizes the speaker\'s gratitude.',
    hint: 'Someone does a favor FOR me.',
    examples: [
    { jp: '母が弁当を作ってくれました。', cloze: 'てくれました', en: 'My mother made a lunch box for me.' },
    { jp: '友達が手伝ってくれました。', cloze: 'てくれました', en: 'My friend helped me.' },
    { jp: '先生が説明してくれました。', cloze: 'てくれました', en: 'The teacher explained it to me.' },
    ],
  },
  {
    id: 'g037', pattern: '〜てみる', english: 'to try doing something',
    level: 'N4',
    explanation: 'てみる expresses trying out an action to see what happens. It conveys the nuance of doing something as an experiment or attempt.',
    hint: 'Try doing ~ (to see what happens).',
    examples: [
    { jp: 'この料理を食べてみました。', cloze: 'てみました', en: 'I tried eating this dish.' },
    { jp: '新しい方法でやってみます。', cloze: 'てみます', en: 'I\'ll try doing it with a new method.' },
    { jp: '日本語で話してみてください。', cloze: 'てみてください', en: 'Please try speaking in Japanese.' },
    ],
  },
  {
    id: 'g038', pattern: '〜ておく', english: 'to do something in advance; to leave something done',
    level: 'N4',
    explanation: 'ておく means to do something ahead of time in preparation, or to leave a state as it is for a purpose. It often implies doing something now for future convenience.',
    hint: 'Do in advance; prepare ahead.',
    examples: [
    { jp: '旅行の前にホテルを予約しておきます。', cloze: 'ておきます', en: 'I\'ll reserve a hotel in advance before the trip.' },
    { jp: '試験のために単語を覚えておきました。', cloze: 'ておきました', en: 'I memorized vocabulary in advance for the exam.' },
    { jp: 'ドアを開けておいてください。', cloze: 'ておいてください', en: 'Please leave the door open.' },
    ],
  },
  {
    id: 'g039', pattern: '〜てしまった', english: 'ended up doing; did (regrettably / completely)',
    level: 'N4',
    explanation: 'てしまった (past of てしまう) expresses that something was completed — often with a nuance of regret, carelessness, or an unintended result.',
    hint: 'Accidentally / regrettably did ~.',
    examples: [
    { jp: '財布を忘れてしまった。', cloze: 'てしまった', en: 'I went and forgot my wallet.' },
    { jp: 'ケーキを全部食べてしまいました。', cloze: 'てしまいました', en: 'I ended up eating all the cake.' },
    { jp: '大切なファイルを消してしまいました。', cloze: 'てしまいました', en: 'I accidentally deleted an important file.' },
    ],
  },
  {
    id: 'g040', pattern: '〜ようになる', english: 'to come to (do); to reach the point where',
    level: 'N4',
    explanation: 'ようになる expresses a change in ability, habit, or state over time. It indicates that something has gradually come to be the case.',
    hint: 'Gradual change: \'came to ~\'.',
    examples: [
    { jp: '毎日運動するようになりました。', cloze: 'ようになりました', en: 'I came to exercise every day.' },
    { jp: '漢字が読めるようになりました。', cloze: 'ようになりました', en: 'I became able to read kanji.' },
    { jp: '日本語で夢を見るようになりました。', cloze: 'ようになりました', en: 'I came to dream in Japanese.' },
    ],
  },
  {
    id: 'g041', pattern: '〜ようにする', english: 'to make an effort to; to try to (maintain a habit)',
    level: 'N4',
    explanation: 'ようにする expresses making a conscious effort or decision to do something regularly. Unlike ようになる (natural change), this implies intentional effort.',
    hint: 'Make a conscious effort to ~.',
    examples: [
    { jp: '毎日野菜を食べるようにしています。', cloze: 'ようにしています', en: 'I make it a point to eat vegetables every day.' },
    { jp: '遅刻しないようにします。', cloze: 'ようにします', en: 'I will try not to be late.' },
    { jp: '早く寝るようにしてください。', cloze: 'ようにしてください', en: 'Please try to go to bed early.' },
    ],
  },
  {
    id: 'g042', pattern: '〜らしい', english: 'seems like; I heard that (inference from evidence or hearsay)',
    level: 'N4',
    explanation: 'らしい expresses inference based on information heard from others or indirect evidence. It follows plain-form verbs, adjectives, nouns.',
    hint: 'Inference from hearsay or evidence.',
    examples: [
    { jp: '彼は来週転勤するらしいです。', cloze: 'らしいです', en: 'It seems he is transferring next week.' },
    { jp: 'あの映画はとても面白いらしいです。', cloze: 'らしいです', en: 'I heard that movie is very interesting.' },
    { jp: '田中さんは病気らしいです。', cloze: 'らしいです', en: 'It seems that Mr. Tanaka is sick.' },
    ],
  },
  {
    id: 'g043', pattern: '〜そうです (hearsay)', english: 'I heard that ~; they say that ~ (hearsay)',
    level: 'N4',
    explanation: 'そうです following a plain-form clause reports hearsay — information received from another source. It is different from the そうだ of appearance, which attaches to verb/adjective stems.',
    hint: 'Reporting hearsay: \'I heard that ~\'.',
    examples: [
    { jp: '明日は雪が降るそうです。', cloze: 'そうです', en: 'I heard it will snow tomorrow.' },
    { jp: 'あの店はおいしいそうです。', cloze: 'そうです', en: 'I heard that restaurant is delicious.' },
    { jp: '彼女はもう結婚したそうです。', cloze: 'そうです', en: 'I heard she already got married.' },
    ],
  },
  {
    id: 'g044', pattern: '〜そうです (appearance)', english: 'looks like ~; seems like ~ (based on appearance)',
    level: 'N4',
    explanation: 'そうです / そうな attached to a verb or adjective stem expresses that something looks or seems a certain way based on direct observation.',
    hint: 'Looks like ~ (based on what you see).',
    examples: [
    { jp: 'このケーキはおいしそうです。', cloze: 'おいしそうです', en: 'This cake looks delicious.' },
    { jp: '彼は疲れそうな顔をしています。', cloze: '疲れそうな', en: 'He has a look like he\'s tired.' },
    { jp: '雨が降りそうです。', cloze: '降りそうです', en: 'It looks like it\'s going to rain.' },
    ],
  },
  {
    id: 'g045', pattern: '〜という', english: 'called ~; known as ~; the ~ that',
    level: 'N4',
    explanation: 'という connects a name, quote, or content to a noun. It means \'called\', \'known as\', or introduces a clause that defines or describes the noun.',
    hint: 'Called ~; the thing that ~.',
    examples: [
    { jp: '「さくら」という名前の猫がいます。', cloze: 'という', en: 'There is a cat called \'Sakura\'.' },
    { jp: '彼が来ないという話を聞きました。', cloze: 'という', en: 'I heard the news that he won\'t come.' },
    { jp: '東京という都市は大きいです。', cloze: 'という', en: 'The city called Tokyo is large.' },
    ],
  },
  {
    id: 'g046', pattern: 'なかなか〜ない', english: 'not easily; not readily; just won\'t ~',
    level: 'N4',
    explanation: 'なかなか with a negative verb expresses that something does not happen as easily or as quickly as expected. It carries a nuance of frustration or difficulty.',
    hint: 'Won\'t happen easily; stubbornly not ~.',
    examples: [
    { jp: 'なかなか寝られません。', cloze: 'なかなか', en: 'I just can\'t seem to fall asleep.' },
    { jp: 'この問題はなかなか解けません。', cloze: 'なかなか', en: 'This problem just won\'t get solved.' },
    { jp: '彼女はなかなか来ません。', cloze: 'なかなか', en: 'She\'s just not coming.' },
    ],
  },
  {
    id: 'g047', pattern: '〜ばかり', english: 'only; nothing but; just finished (depending on context)',
    level: 'N4',
    explanation: 'ばかり after a noun or verb (plain form) means \'nothing but ~\' or \'only ~\'. After a past te-form, it means \'just did ~\'.',
    hint: 'Nothing but ~; just finished ~.',
    examples: [
    { jp: '甘いものばかり食べています。', cloze: 'ばかり', en: 'I eat nothing but sweets.' },
    { jp: '彼はゲームばかりしている。', cloze: 'ばかり', en: 'He does nothing but play games.' },
    { jp: '今起きたばかりです。', cloze: 'ばかり', en: 'I just woke up.' },
    ],
  },
  {
    id: 'g048', pattern: '〜だけ', english: 'only; just; that\'s all',
    level: 'N4',
    explanation: 'だけ limits the scope to only that thing. It is less restrictive in tone than しか〜ない and can be used in both positive and negative sentences.',
    hint: 'Only ~; just ~ (neutral limit).',
    examples: [
    { jp: '一つだけ質問があります。', cloze: 'だけ', en: 'I have just one question.' },
    { jp: '見るだけで買いません。', cloze: 'だけ', en: 'I\'ll just look and won\'t buy.' },
    { jp: '少しだけ手伝ってください。', cloze: 'だけ', en: 'Please help me just a little.' },
    ],
  },
  {
    id: 'g049', pattern: '〜しか〜ない', english: 'nothing but; only (with negative — emphasis on limitation)',
    level: 'N4',
    explanation: 'しか must be used with a negative verb and emphasizes that there is ONLY this one thing — nothing else. It conveys a stronger sense of restriction than だけ.',
    hint: 'Only ~ (and nothing else) — requires negative.',
    examples: [
    { jp: '財布に五百円しかありません。', cloze: 'しか', en: 'I only have 500 yen in my wallet.' },
    { jp: 'この仕事は君にしかできない。', cloze: 'しか', en: 'Only you can do this job.' },
    { jp: '一時間しか寝られませんでした。', cloze: 'しか', en: 'I could only sleep for one hour.' },
    ],
  },
  {
    id: 'g050', pattern: '〜はずです', english: 'should be; ought to be; expected to be',
    level: 'N4',
    explanation: 'はずです expresses the speaker\'s expectation or logical conclusion based on known facts. It indicates something should be the case based on reasoning.',
    hint: 'Logical expectation: \'should be ~\'.',
    examples: [
    { jp: '彼はもう着いているはずです。', cloze: 'はずです', en: 'He should have arrived by now.' },
    { jp: 'この電車は六時に来るはずです。', cloze: 'はずです', en: 'This train should come at six.' },
    { jp: '薬を飲んだので、よくなるはずです。', cloze: 'はずです', en: 'Since I took medicine, I should get better.' },
    ],
  },
  {
    id: 'g051', pattern: '〜かもしれない', english: 'might; may; perhaps',
    level: 'N4',
    explanation: 'かもしれない expresses possibility or uncertainty — something might be the case, but the speaker is not sure. It is weaker than でしょう.',
    hint: 'Uncertain possibility: \'might ~\'.',
    examples: [
    { jp: '明日は雪が降るかもしれません。', cloze: 'かもしれません', en: 'It might snow tomorrow.' },
    { jp: '彼女はもう帰ったかもしれない。', cloze: 'かもしれない', en: 'She might have already gone home.' },
    { jp: 'これは間違いかもしれません。', cloze: 'かもしれません', en: 'This might be a mistake.' },
    ],
  },
  {
    id: 'g052', pattern: '〜まま', english: 'as is; leaving ~ in a state; without changing',
    level: 'N4',
    explanation: 'まま expresses that a state remains unchanged — something is left as it is. It follows verbs (た-form or dictionary form + まま) or nouns + の.',
    hint: 'Left as is; unchanged state.',
    examples: [
    { jp: '靴を履いたまま部屋に入った。', cloze: 'まま', en: 'He entered the room with his shoes still on.' },
    { jp: '電気をつけたまま寝てしまいました。', cloze: 'まま', en: 'I fell asleep with the light still on.' },
    { jp: '窓を開けたまま出かけました。', cloze: 'まま', en: 'I went out with the window left open.' },
    ],
  },
  {
    id: 'g053', pattern: '〜について', english: 'about; concerning; regarding',
    level: 'N4',
    explanation: 'について follows a noun and means \'about\' or \'concerning\' that topic. It introduces the subject matter of a discussion, question, or writing.',
    hint: 'About / concerning ~.',
    examples: [
    { jp: '日本の文化について勉強しています。', cloze: 'について', en: 'I am studying about Japanese culture.' },
    { jp: 'この問題についてどう思いますか。', cloze: 'について', en: 'What do you think about this problem?' },
    { jp: '環境問題についてレポートを書きました。', cloze: 'について', en: 'I wrote a report about environmental issues.' },
    ],
  },
  {
    id: 'g054', pattern: '〜によって', english: 'depending on; according to; by means of; by (agent)',
    level: 'N4',
    explanation: 'によって has several uses: it can indicate the agent of a passive sentence, a means or method, or variation depending on something.',
    hint: 'By / depending on / according to ~.',
    examples: [
    { jp: 'この絵はピカソによって描かれました。', cloze: 'によって', en: 'This painting was drawn by Picasso.' },
    { jp: '人によって意見が違います。', cloze: 'によって', en: 'Opinions differ depending on the person.' },
    { jp: '努力によって夢は実現できます。', cloze: 'によって', en: 'Dreams can be realized through effort.' },
    ],
  },
  {
    id: 'g055', pattern: '〜ために / 〜ため', english: 'in order to; for the purpose of; because of',
    level: 'N4',
    explanation: 'ために / ため follows a verb (dictionary form) for purpose (\'in order to\') or a plain-form verb/noun for cause (\'because of\'). Context determines which meaning applies.',
    hint: 'For the purpose of ~ / because of ~.',
    examples: [
    { jp: '日本語を上手になるために毎日練習します。', cloze: 'ために', en: 'I practice every day in order to improve my Japanese.' },
    { jp: '家族のために働いています。', cloze: 'ために', en: 'I work for my family.' },
    { jp: '病気のため、学校を休みました。', cloze: 'ため', en: 'I was absent from school because of illness.' },
    ],
  },
  {
    id: 'g056', pattern: '〜といえば', english: 'speaking of ~; when it comes to ~; if you mention ~',
    level: 'N3',
    explanation: 'といえば is used to shift a topic or make an association. It often means \'speaking of ~\' and introduces something that comes to mind when the topic is mentioned.',
    hint: 'Speaking of ~; that reminds me of ~.',
    examples: [
    { jp: '日本といえば、富士山が有名です。', cloze: 'といえば', en: 'Speaking of Japan, Mt. Fuji is famous.' },
    { jp: '夏といえば、花火大会ですね。', cloze: 'といえば', en: 'When it comes to summer, it\'s fireworks festivals, isn\'t it.' },
    { jp: '京都といえば、金閣寺を思い出します。', cloze: 'といえば', en: 'Speaking of Kyoto, I think of Kinkaku-ji.' },
    ],
  },
  {
    id: 'g057', pattern: '〜に対して', english: 'toward; against; in contrast to; regarding',
    level: 'N3',
    explanation: 'に対して indicates a target of an action, feeling, or attitude, or contrasts two things. It follows nouns and means \'toward\', \'against\', or \'in contrast to\'.',
    hint: 'Directed toward ~; in contrast to ~.',
    examples: [
    { jp: '先生の意見に対して反論しました。', cloze: 'に対して', en: 'I argued against the teacher\'s opinion.' },
    { jp: '彼は外国人に対してとても親切です。', cloze: 'に対して', en: 'He is very kind toward foreigners.' },
    { jp: '兄が文系なのに対して、弟は理系です。', cloze: 'に対して', en: 'In contrast to his older brother who is liberal arts, the younger brother is science.' },
    ],
  },
  {
    id: 'g058', pattern: '〜に関して', english: 'regarding; concerning; in relation to',
    level: 'N3',
    explanation: 'に関して follows a noun and means \'regarding\' or \'concerning\'. It is more formal than について and often used in written or official contexts.',
    hint: 'Formal \'regarding ~\'.',
    examples: [
    { jp: 'この件に関してご連絡します。', cloze: 'に関して', en: 'I will contact you regarding this matter.' },
    { jp: '環境問題に関して会議が開かれました。', cloze: 'に関して', en: 'A conference was held concerning environmental issues.' },
    { jp: '契約に関してご質問があればお知らせください。', cloze: 'に関して', en: 'Please let us know if you have any questions regarding the contract.' },
    ],
  },
  {
    id: 'g059', pattern: '〜において', english: 'in; at; in terms of (formal location or context)',
    level: 'N3',
    explanation: 'において is a formal equivalent of で, indicating the place, time, or context in which something occurs. It is common in academic and formal writing.',
    hint: 'Formal \'in\' / \'at\' / \'in the context of\'.',
    examples: [
    { jp: 'この研究において重要な発見がありました。', cloze: 'において', en: 'There was an important discovery in this research.' },
    { jp: '現代社会においてITは不可欠です。', cloze: 'において', en: 'IT is indispensable in modern society.' },
    { jp: 'オリンピックにおいて日本は金メダルを獲得しました。', cloze: 'において', en: 'Japan won gold medals at the Olympics.' },
    ],
  },
  {
    id: 'g060', pattern: '〜によって (means)', english: 'by means of; through; via',
    level: 'N3',
    explanation: 'によって in N3 contexts focuses on means or method — \'by means of ~\' or \'through ~\'. It indicates how something is accomplished.',
    hint: 'By means of ~; through ~.',
    examples: [
    { jp: '話し合いによって問題が解決されました。', cloze: 'によって', en: 'The problem was resolved through discussion.' },
    { jp: 'インターネットによって情報が広まりました。', cloze: 'によって', en: 'Information spread through the internet.' },
    { jp: '法律によって守られています。', cloze: 'によって', en: 'It is protected by law.' },
    ],
  },
  {
    id: 'g061', pattern: '〜わけだ', english: 'that\'s why; it means that; no wonder',
    level: 'N3',
    explanation: 'わけだ expresses a logical conclusion or explains why something is the way it is. It conveys \'that\'s why\' or \'it makes sense that\', based on reasoning.',
    hint: 'Logical conclusion: \'no wonder\', \'that\'s why\'.',
    examples: [
    { jp: '三年間日本に住んでいたから、日本語が上手なわけだ。', cloze: 'わけだ', en: 'No wonder your Japanese is good — you lived in Japan for three years.' },
    { jp: '練習しないと上達しないわけです。', cloze: 'わけです', en: 'It makes sense that you won\'t improve if you don\'t practice.' },
    { jp: '彼が来ないわけが分かりました。', cloze: 'わけ', en: 'I understood the reason why he isn\'t coming.' },
    ],
  },
  {
    id: 'g062', pattern: '〜わけではない', english: 'it doesn\'t mean that; it\'s not that',
    level: 'N3',
    explanation: 'わけではない softly negates or qualifies a statement — \'it\'s not that ~\'. It is used to correct a misunderstanding or prevent an overgeneralization.',
    hint: 'It\'s not necessarily that ~.',
    examples: [
    { jp: '嫌いなわけではないが、あまり食べません。', cloze: 'わけではない', en: 'It\'s not that I dislike it, I just don\'t eat much of it.' },
    { jp: '全員が賛成しているわけではありません。', cloze: 'わけではありません', en: 'It doesn\'t mean everyone agrees.' },
    { jp: 'お金があれば幸せなわけではない。', cloze: 'わけではない', en: 'It doesn\'t mean that having money makes you happy.' },
    ],
  },
  {
    id: 'g063', pattern: '〜ことになっている', english: 'it is decided/expected that; it is supposed to',
    level: 'N3',
    explanation: 'ことになっている describes a rule, regulation, or arrangement that has been established — something that is expected or supposed to happen based on prior decision.',
    hint: 'It\'s been decided/arranged that ~.',
    examples: [
    { jp: 'この建物では禁煙することになっています。', cloze: 'ことになっています', en: 'It is decided that this building is non-smoking.' },
    { jp: '来月日本に出張することになっています。', cloze: 'ことになっています', en: 'It is arranged that I will go on a business trip to Japan next month.' },
    { jp: '授業は八時に始まることになっています。', cloze: 'ことになっています', en: 'Classes are supposed to start at eight.' },
    ],
  },
  {
    id: 'g064', pattern: '〜ことにする', english: 'to decide to; to make it a rule to',
    level: 'N3',
    explanation: 'ことにする expresses a personal decision. The speaker decides to do or not do something. ことにしている means it is one\'s established personal rule.',
    hint: 'I personally decide to ~.',
    examples: [
    { jp: '毎朝ジョギングすることにしました。', cloze: 'ことにしました', en: 'I decided to jog every morning.' },
    { jp: 'お酒を飲まないことにしています。', cloze: 'ことにしています', en: 'I have made it a rule not to drink alcohol.' },
    { jp: 'その話はなかったことにしましょう。', cloze: 'ことにしましょう', en: 'Let\'s pretend that conversation never happened.' },
    ],
  },
  {
    id: 'g065', pattern: '〜ようだ', english: 'it seems; it looks like; it appears (based on observation)',
    level: 'N3',
    explanation: 'ようだ expresses the speaker\'s inference or impression based on direct observation or information. It is a subjective judgment about a situation.',
    hint: 'Seems like ~ (based on observation).',
    examples: [
    { jp: '彼は疲れているようです。', cloze: 'ようです', en: 'He seems to be tired.' },
    { jp: '外は寒いようだ。', cloze: 'ようだ', en: 'It seems to be cold outside.' },
    { jp: 'その映画はとても人気があるようです。', cloze: 'ようです', en: 'That movie seems to be very popular.' },
    ],
  },
  {
    id: 'g066', pattern: '〜みたいだ', english: 'seems like; looks like (casual inference)',
    level: 'N3',
    explanation: 'みたいだ is the casual equivalent of ようだ. It expresses that something seems to be a certain way based on what the speaker observes or senses.',
    hint: 'Casual \'seems like ~\'.',
    examples: [
    { jp: '彼女は怒っているみたいだ。', cloze: 'みたいだ', en: 'She seems to be angry.' },
    { jp: 'この映画、面白そうみたいだね。', cloze: 'みたいだ', en: 'This movie seems interesting, doesn\'t it.' },
    { jp: '熱があるみたいです。', cloze: 'みたいです', en: 'It seems I have a fever.' },
    ],
  },
  {
    id: 'g067', pattern: '〜らしい (na-adj usage / typical)', english: 'typical of; -like; befitting',
    level: 'N3',
    explanation: 'らしい attached directly to a noun (as a suffix) means \'typical of\' or \'characteristic of\' that thing. This differs from its N4 hearsay usage.',
    hint: 'Typical of ~; truly ~-like.',
    examples: [
    { jp: '今日はやっと春らしい天気になりました。', cloze: 'らしい', en: 'Today the weather has finally become spring-like.' },
    { jp: '彼は男らしい人です。', cloze: '男らしい', en: 'He is a manly person.' },
    { jp: '子どもらしい発想ですね。', cloze: '子どもらしい', en: 'That\'s a very childlike idea.' },
    ],
  },
  {
    id: 'g068', pattern: '〜さえ〜ば', english: 'if only ~; as long as ~ (minimal condition)',
    level: 'N3',
    explanation: 'さえ〜ば expresses that if one minimal condition is met, everything else will be fine. さえ marks the key condition and ば introduces the conditional.',
    hint: 'If only ~ (one thing is enough).',
    examples: [
    { jp: 'お金さえあれば、旅行できます。', cloze: 'さえあれば', en: 'As long as I have money, I can travel.' },
    { jp: '健康でさえあれば、何でもできる。', cloze: 'さえあれば', en: 'As long as you\'re healthy, you can do anything.' },
    { jp: '君さえいれば、ほかには何もいらない。', cloze: 'さえいれば', en: 'As long as I have you, I don\'t need anything else.' },
    ],
  },
  {
    id: 'g069', pattern: '〜さえ〜たら', english: 'if only ~ (conditional with たら)',
    level: 'N3',
    explanation: 'さえ〜たら is similar to さえ〜ば and expresses that just one minimal condition being met is sufficient. たら is the conditional form here.',
    hint: 'Once ~ happens, everything is fine.',
    examples: [
    { jp: '試験さえ終わったら、旅行に行きます。', cloze: 'さえ終わったら', en: 'Once the exam is over, I\'ll go on a trip.' },
    { jp: '許可さえもらえたら、すぐに始めます。', cloze: 'さえもらえたら', en: 'If only I can get permission, I\'ll start right away.' },
    { jp: '彼さえ来たら、パーティーを始められます。', cloze: 'さえ来たら', en: 'Once he arrives, we can start the party.' },
    ],
  },
  {
    id: 'g070', pattern: '〜てばかりいる', english: 'do nothing but ~; keep doing ~',
    level: 'N3',
    explanation: 'てばかりいる expresses that someone does nothing but a certain action, often with a negative or critical nuance. It implies excessiveness.',
    hint: 'Does nothing but ~ (negative nuance).',
    examples: [
    { jp: '彼は遊んでばかりいる。', cloze: 'でばかりいる', en: 'He does nothing but play.' },
    { jp: '文句を言ってばかりいないで、行動してください。', cloze: 'てばかりいないで', en: 'Stop just complaining and take action.' },
    { jp: '寝てばかりいると体に悪いですよ。', cloze: 'てばかりいる', en: 'It\'s bad for your body if you just keep sleeping.' },
    ],
  },
  {
    id: 'g071', pattern: '〜ことはない', english: 'there is no need to; don\'t have to',
    level: 'N3',
    explanation: 'ことはない follows a dictionary-form verb and expresses that there is no need or reason to do that thing. It is often used to reassure someone.',
    hint: 'No need to ~.',
    examples: [
    { jp: 'そんなに心配することはないですよ。', cloze: 'ことはない', en: 'There\'s no need to worry so much.' },
    { jp: '謝ることはありません。', cloze: 'ことはありません', en: 'There is no need to apologize.' },
    { jp: '急ぐことはないよ、時間はたくさんある。', cloze: 'ことはない', en: 'There\'s no need to rush, there\'s plenty of time.' },
    ],
  },
  {
    id: 'g072', pattern: '〜というより', english: 'rather than saying ~; more ~ than',
    level: 'N3',
    explanation: 'というより corrects or refines a description, suggesting that a different word or description is more accurate. It means \'rather than\' or \'it would be more accurate to say\'.',
    hint: 'More accurately: rather than ~.',
    examples: [
    { jp: '彼は怖いというより、厳しい先生です。', cloze: 'というより', en: 'Rather than scary, he is a strict teacher.' },
    { jp: '好きというより、依存しているんだと思う。', cloze: 'というより', en: 'I think it\'s more like dependence than love.' },
    { jp: '疲れているというより、眠い感じがします。', cloze: 'というより', en: 'I feel more sleepy than tired.' },
    ],
  },
  {
    id: 'g073', pattern: '〜にしては', english: 'for ~; considering ~; given that ~',
    level: 'N3',
    explanation: 'にしては indicates that the result or state is unexpected given the condition. It means \'for a ~\' or \'considering it\'s a ~\', implying a contrast with the expected.',
    hint: 'For a ~; surprisingly given ~.',
    examples: [
    { jp: '初めてにしては上手に書けましたね。', cloze: 'にしては', en: 'You wrote it quite well for a first time.' },
    { jp: '子どもにしては難しいことを言いますね。', cloze: 'にしては', en: 'That\'s a difficult thing to say for a child.' },
    { jp: '留学生にしては敬語の使い方が上手です。', cloze: 'にしては', en: 'For an international student, your use of keigo is impressive.' },
    ],
  },
  {
    id: 'g074', pattern: '〜わりに', english: 'for ~; considering ~; although ~ (yet unexpectedly)',
    level: 'N3',
    explanation: 'わりに expresses that the result is unexpectedly different from what would be expected given the condition — often better or worse than expected.',
    hint: 'Unexpectedly ~ given the circumstances.',
    examples: [
    { jp: '値段が安いわりに、品質がいいです。', cloze: 'わりに', en: 'For the price being cheap, the quality is good.' },
    { jp: '彼は年齢のわりに若く見えます。', cloze: 'わりに', en: 'He looks young for his age.' },
    { jp: '練習したわりに、うまくいきませんでした。', cloze: 'わりに', en: 'Despite having practiced, it didn\'t go well.' },
    ],
  },
  {
    id: 'g075', pattern: '〜はずがない', english: 'there\'s no way ~; cannot possibly be',
    level: 'N3',
    explanation: 'はずがない expresses strong disbelief — logically, something cannot be the case. It is the negative counterpart of はずだ.',
    hint: 'No way ~; impossible that ~.',
    examples: [
    { jp: '彼がそんなことを言うはずがない。', cloze: 'はずがない', en: 'There\'s no way he would say something like that.' },
    { jp: 'こんなに頑張っているのに、失敗するはずがない。', cloze: 'はずがない', en: 'There\'s no way I\'ll fail when I\'m working this hard.' },
    { jp: '昨日会ったばかりだから、忘れるはずがない。', cloze: 'はずがない', en: 'We just met yesterday, so there\'s no way I\'d forget.' },
    ],
  },
  {
    id: 'g076', pattern: '〜べきだ', english: 'should; ought to (moral obligation)',
    level: 'N3',
    explanation: 'べきだ expresses a strong moral or logical obligation — something one should or ought to do. It is stronger than ほうがいい.',
    hint: 'Moral \'should / ought to ~\'.',
    examples: [
    { jp: '約束は守るべきだ。', cloze: 'べきだ', en: 'You should keep promises.' },
    { jp: 'もっと早く連絡すべきでした。', cloze: 'すべきでした', en: 'I should have contacted you sooner.' },
    { jp: '健康のために運動するべきだと思います。', cloze: 'べきだ', en: 'I think you should exercise for your health.' },
    ],
  },
  {
    id: 'g077', pattern: '〜べきではない', english: 'should not; ought not to',
    level: 'N3',
    explanation: 'べきではない is the negative form of べきだ, expressing that something ought not to be done — a moral or logical prohibition.',
    hint: 'Ought not to ~.',
    examples: [
    { jp: '嘘をつくべきではない。', cloze: 'べきではない', en: 'You should not lie.' },
    { jp: '他人の悪口を言うべきではありません。', cloze: 'べきではありません', en: 'You should not speak ill of others.' },
    { jp: '食事中にスマホを見るべきではない。', cloze: 'べきではない', en: 'You should not look at your phone during meals.' },
    ],
  },
  {
    id: 'g078', pattern: '〜ものだ', english: 'that\'s how things are; should naturally; used to (general truth or nostalgia)',
    level: 'N3',
    explanation: 'ものだ expresses a general truth, natural expectation, or nostalgic recollection. It can mean \'that\'s just how it is\' or \'we used to ~\' depending on tense.',
    hint: 'General truth; natural expectation; \'we used to ~\'.',
    examples: [
    { jp: '人間は失敗するものだ。', cloze: 'ものだ', en: 'Humans are bound to make mistakes.' },
    { jp: '子どものころ、よく川で泳いだものだ。', cloze: 'ものだ', en: 'When I was a child, I used to swim in the river often.' },
    { jp: '努力すれば報われるものだ。', cloze: 'ものだ', en: 'Hard work naturally brings its rewards.' },
    ],
  },
  {
    id: 'g079', pattern: '〜ものだから', english: 'because; since (expressing excuse or strong reason)',
    level: 'N3',
    explanation: 'ものだから (or もので) gives a reason or excuse, often explaining why something happened that was unexpected. It has a slightly apologetic or explanatory tone.',
    hint: 'Because ~ (explanatory, excuse-like).',
    examples: [
    { jp: '電車が遅れたものだから、遅刻してしまいました。', cloze: 'ものだから', en: 'Because the train was delayed, I ended up being late.' },
    { jp: 'うれしかったものだから、思わず泣いてしまいました。', cloze: 'ものだから', en: 'Because I was so happy, I ended up crying without thinking.' },
    { jp: '子どものころの話なものだから、よく覚えていません。', cloze: 'ものだから', en: 'Because it\'s a story from childhood, I don\'t remember it well.' },
    ],
  },
  {
    id: 'g080', pattern: '〜てならない', english: 'can\'t help feeling ~; unbearably ~',
    level: 'N3',
    explanation: 'てならない expresses an overwhelming, uncontrollable feeling or sensation. It is used with emotion or sensation words and means the feeling is so strong it cannot be suppressed.',
    hint: 'Overwhelmingly / unbearably ~ (can\'t help it).',
    examples: [
    { jp: '故郷が恋しくてならない。', cloze: 'てならない', en: 'I can\'t help but long for my hometown.' },
    { jp: '合格できるか心配でならない。', cloze: 'でならない', en: 'I can\'t help but worry whether I can pass.' },
    { jp: '彼の言葉が気になってならない。', cloze: 'てならない', en: 'I can\'t stop thinking about what he said.' },
    ],
  },
  {
    id: 'g081', pattern: '〜に際して', english: 'on the occasion of; when (formal)',
    level: 'N2',
    explanation: 'に際して follows a noun or verb (dictionary form) and indicates the occasion or moment something takes place. It is formal and used for important or special events.',
    hint: 'Formal \'on the occasion of ~\'.',
    examples: [
    { jp: '入学に際して、新しいパソコンを買いました。', cloze: 'に際して', en: 'On the occasion of enrolling, I bought a new computer.' },
    { jp: 'ご結婚に際して、心よりお祝い申し上げます。', cloze: 'に際して', en: 'On the occasion of your marriage, I offer my sincere congratulations.' },
    { jp: '契約を結ぶに際して、条件をよく確認してください。', cloze: 'に際して', en: 'When concluding the contract, please carefully confirm the terms.' },
    ],
  },
  {
    id: 'g082', pattern: '〜に伴って', english: 'as ~; along with; accompanying (change in proportion)',
    level: 'N2',
    explanation: 'に伴って expresses that as one thing changes or happens, another thing changes accordingly. It indicates a proportional or accompanying relationship.',
    hint: 'As ~ increases/changes, so does ~.',
    examples: [
    { jp: '経済成長に伴って、生活水準も上がった。', cloze: 'に伴って', en: 'Along with economic growth, the standard of living also rose.' },
    { jp: '高齢化に伴って、介護の需要が増えています。', cloze: 'に伴って', en: 'As the population ages, demand for nursing care is increasing.' },
    { jp: '技術の進歩に伴って、新しい問題も生まれた。', cloze: 'に伴って', en: 'As technology advances, new problems have also arisen.' },
    ],
  },
  {
    id: 'g083', pattern: '〜を通じて', english: 'through; via; throughout',
    level: 'N2',
    explanation: 'を通じて means \'through\' or \'via\' a medium, channel, or period. It can indicate a means of communication/action or a duration throughout which something applies.',
    hint: 'Through ~ (as a medium or duration).',
    examples: [
    { jp: 'SNSを通じて多くの人と繋がれます。', cloze: 'を通じて', en: 'You can connect with many people through social media.' },
    { jp: '留学を通じて自分を成長させました。', cloze: 'を通じて', en: 'I grew as a person through studying abroad.' },
    { jp: 'この地域は一年を通じて温暖です。', cloze: 'を通じて', en: 'This region is warm throughout the year.' },
    ],
  },
  {
    id: 'g084', pattern: '〜にもかかわらず', english: 'despite; in spite of; regardless of',
    level: 'N2',
    explanation: 'にもかかわらず follows a noun, na-adjective, or plain-form verb and expresses that something happens despite what would prevent or contradict it.',
    hint: 'Despite ~; in spite of ~.',
    examples: [
    { jp: '雨にもかかわらず、試合は行われました。', cloze: 'にもかかわらず', en: 'Despite the rain, the game was held.' },
    { jp: '注意したにもかかわらず、同じミスをした。', cloze: 'にもかかわらず', en: 'Despite being warned, he made the same mistake.' },
    { jp: '高齢にもかかわらず、元気に働いています。', cloze: 'にもかかわらず', en: 'Despite being elderly, she works energetically.' },
    ],
  },
  {
    id: 'g085', pattern: '〜にしたがって', english: 'as ~; in accordance with; following',
    level: 'N2',
    explanation: 'にしたがって expresses that as one thing progresses, another changes accordingly — \'as ~ happens, ~\'. Also means \'in accordance with\' rules or instructions.',
    hint: 'As ~ progresses; following ~.',
    examples: [
    { jp: '時間がたつにしたがって、痛みが増した。', cloze: 'にしたがって', en: 'As time passed, the pain increased.' },
    { jp: '規則にしたがって行動してください。', cloze: 'にしたがって', en: 'Please act in accordance with the rules.' },
    { jp: '練習するにしたがって、上達していきます。', cloze: 'にしたがって', en: 'As you practice, you will improve.' },
    ],
  },
  {
    id: 'g086', pattern: '〜において (formal)', english: 'in; at; on; regarding (formal context marker)',
    level: 'N2',
    explanation: 'At N2, において is used in more complex formal and written contexts to mark a specific domain, period, or field in which something applies or is discussed.',
    hint: 'Formal \'in the field/context of ~\'.',
    examples: [
    { jp: '医療の分野においても技術革新が進んでいます。', cloze: 'において', en: 'Technological innovation is also advancing in the field of medicine.' },
    { jp: '法律においてはすべての人が平等です。', cloze: 'において', en: 'Under the law, all people are equal.' },
    { jp: 'グローバル競争においては速さが重要です。', cloze: 'において', en: 'In global competition, speed is important.' },
    ],
  },
  {
    id: 'g087', pattern: '〜に基づいて', english: 'based on; grounded in',
    level: 'N2',
    explanation: 'に基づいて follows a noun and indicates that something is done based on or grounded in that foundation — data, law, experience, etc.',
    hint: 'Based on ~ / grounded in ~.',
    examples: [
    { jp: 'データに基づいて分析しました。', cloze: 'に基づいて', en: 'I analyzed based on the data.' },
    { jp: 'この映画は実話に基づいています。', cloze: 'に基づいています', en: 'This movie is based on a true story.' },
    { jp: '法律に基づいて判断が下されました。', cloze: 'に基づいて', en: 'The decision was made based on the law.' },
    ],
  },
  {
    id: 'g088', pattern: '〜からといって', english: 'just because ~; even though ~ (doesn\'t mean)',
    level: 'N2',
    explanation: 'からといって means \'just because ~\' and signals that the reason given does not justify the conclusion. It often precedes a negative statement.',
    hint: 'Just because ~ doesn\'t mean ~.',
    examples: [
    { jp: 'お金があるからといって、幸せとは限らない。', cloze: 'からといって', en: 'Just because you have money doesn\'t mean you\'re happy.' },
    { jp: '忙しいからといって、食事を抜いてはいけません。', cloze: 'からといって', en: 'Just because you\'re busy, you shouldn\'t skip meals.' },
    { jp: '失敗したからといって、諦めることはない。', cloze: 'からといって', en: 'Just because you failed doesn\'t mean you should give up.' },
    ],
  },
  {
    id: 'g089', pattern: '〜としても', english: 'even if ~; even assuming ~',
    level: 'N2',
    explanation: 'としても presents a hypothetical concession — \'even if we assume ~\'. It acknowledges a scenario but states it doesn\'t change the conclusion.',
    hint: 'Even if we assume ~.',
    examples: [
    { jp: '今から急いだとしても、間に合わないでしょう。', cloze: 'としても', en: 'Even if you hurry from now, you probably won\'t make it.' },
    { jp: '彼が正しいとしても、その方法は問題があります。', cloze: 'としても', en: 'Even if he is right, that method has problems.' },
    { jp: '無理だとしても、挑戦してみる価値はある。', cloze: 'としても', en: 'Even assuming it\'s impossible, it\'s worth trying.' },
    ],
  },
  {
    id: 'g090', pattern: '〜にすぎない', english: 'nothing more than; merely; only',
    level: 'N2',
    explanation: 'にすぎない means \'it is nothing more than ~\'. It minimizes or dismisses what precedes it, suggesting something is less significant than it appears.',
    hint: 'Merely ~; nothing more than ~.',
    examples: [
    { jp: 'それは噂にすぎない。', cloze: 'にすぎない', en: 'That is nothing more than a rumor.' },
    { jp: '私はただのアドバイザーにすぎません。', cloze: 'にすぎません', en: 'I am merely an advisor.' },
    { jp: 'これは一つの例にすぎません。', cloze: 'にすぎません', en: 'This is merely one example.' },
    ],
  },
  {
    id: 'g091', pattern: '〜ものの', english: 'although; even though (unexpected result)',
    level: 'N2',
    explanation: 'ものの follows a plain-form verb or adjective and concedes a point, then introduces a contrasting or unexpected result. Like \'although ~ ...\'.',
    hint: 'Although ~ (unexpected contrast follows).',
    examples: [
    { jp: '試験に合格したものの、自信はありません。', cloze: 'ものの', en: 'Although I passed the exam, I\'m not confident.' },
    { jp: '薬を飲んだものの、熱が下がりません。', cloze: 'ものの', en: 'Although I took medicine, my fever won\'t go down.' },
    { jp: '日本語を勉強しているものの、まだ話せません。', cloze: 'ものの', en: 'Although I\'m studying Japanese, I still can\'t speak it.' },
    ],
  },
  {
    id: 'g092', pattern: '〜ところが', english: 'however; but (unexpected contrast)',
    level: 'N2',
    explanation: 'ところが introduces a result that is contrary to what was expected. It is stronger than でも and signals a surprise or unexpected development.',
    hint: 'Unexpected \'however\' — contrary to expectation.',
    examples: [
    { jp: '合格すると思っていた。ところが、不合格だった。', cloze: 'ところが', en: 'I thought I would pass. However, I failed.' },
    { jp: '簡単だと思ったところが、全然違った。', cloze: 'ところが', en: 'I thought it would be easy; however, it was completely different.' },
    { jp: '早く着いた。ところが、店はまだ閉まっていた。', cloze: 'ところが', en: 'I arrived early. However, the store was still closed.' },
    ],
  },
  {
    id: 'g093', pattern: '〜ながらも', english: 'even though ~; although ~ (despite simultaneous state)',
    level: 'N2',
    explanation: 'ながらも concedes a state or action that exists simultaneously, and then presents an unexpected or contrasting result. \'Even while being ~, ...\'.',
    hint: 'Even while ~; despite simultaneously ~.',
    examples: [
    { jp: '貧しいながらも、幸せに暮らしていました。', cloze: 'ながらも', en: 'Even though they were poor, they lived happily.' },
    { jp: '小さいながらも、立派な会社を経営しています。', cloze: 'ながらも', en: 'Even though it\'s small, they run a fine company.' },
    { jp: '恥ずかしいながらも、発表することができました。', cloze: 'ながらも', en: 'Even though I was embarrassed, I was able to give the presentation.' },
    ],
  },
  {
    id: 'g094', pattern: '〜だけに', english: 'precisely because; all the more because; as expected of',
    level: 'N2',
    explanation: 'だけに expresses that a result is intensified or unsurprising because of the preceding reason. \'Precisely because ~, the result is ~\'.',
    hint: 'All the more so because ~.',
    examples: [
    { jp: '期待していただけに、失敗してとても残念です。', cloze: 'だけに', en: 'Precisely because expectations were high, the failure is very disappointing.' },
    { jp: 'プロだけに、彼の演奏は素晴らしかった。', cloze: 'だけに', en: 'As expected of a professional, his performance was wonderful.' },
    { jp: '高いだけに、品質は保証されています。', cloze: 'だけに', en: 'Precisely because it\'s expensive, the quality is guaranteed.' },
    ],
  },
  {
    id: 'g095', pattern: '〜てはじめて', english: 'only after ~; not until ~ (then first realized)',
    level: 'N2',
    explanation: 'てはじめて expresses that only after a certain experience or action does something become possible or does one realize something for the first time.',
    hint: 'Only after ~ does one first ~.',
    examples: [
    { jp: '失って初めて、その大切さに気づきました。', cloze: '初めて', en: 'Only after losing it did I realize its importance.' },
    { jp: '外国に住んでみて初めて、日本のよさが分かった。', cloze: '初めて', en: 'Only after living abroad did I understand Japan\'s good points.' },
    { jp: '親になって初めて、親の気持ちが分かります。', cloze: '初めて', en: 'Only after becoming a parent do you understand a parent\'s feelings.' },
    ],
  },
  {
    id: 'g096', pattern: '〜に反して', english: 'contrary to; against; in opposition to',
    level: 'N2',
    explanation: 'に反して means \'contrary to\' or \'against\' expectations, rules, or wishes. It follows a noun and indicates that reality is the opposite of what was expected.',
    hint: 'Contrary to ~ / against ~.',
    examples: [
    { jp: '予想に反して、試験は難しかった。', cloze: 'に反して', en: 'Contrary to expectations, the exam was difficult.' },
    { jp: '親の意思に反して、彼は海外へ行った。', cloze: 'に反して', en: 'Against his parents\' wishes, he went abroad.' },
    { jp: '規則に反して行動することは許されません。', cloze: 'に反して', en: 'Acting contrary to the rules is not permitted.' },
    ],
  },
  {
    id: 'g097', pattern: '〜を踏まえて', english: 'based on; taking ~ into account; in light of',
    level: 'N2',
    explanation: 'を踏まえて means to act or decide while taking certain facts or circumstances into account. It implies using something as a basis for the next action.',
    hint: 'Taking ~ into account; in light of ~.',
    examples: [
    { jp: '今回の経験を踏まえて、計画を見直します。', cloze: 'を踏まえて', en: 'Taking this experience into account, I will review the plan.' },
    { jp: '調査結果を踏まえて、対策を立てました。', cloze: 'を踏まえて', en: 'Based on the survey results, we formulated countermeasures.' },
    { jp: '現状を踏まえて最善の方法を選びましょう。', cloze: 'を踏まえて', en: 'Let\'s choose the best method in light of the current situation.' },
    ],
  },
  {
    id: 'g098', pattern: '〜にあたって', english: 'at the time of; when; on the occasion of (preparatory)',
    level: 'N2',
    explanation: 'にあたって marks an important or formal occasion and often implies preparation or consideration for that moment. Similar to に際して but slightly more focus on preparation.',
    hint: 'On the occasion of ~ (with preparation in mind).',
    examples: [
    { jp: '新しいプロジェクトを始めるにあたって、チームを編成しました。', cloze: 'にあたって', en: 'On the occasion of starting the new project, we formed a team.' },
    { jp: '卒業にあたって、先生に感謝の手紙を書きました。', cloze: 'にあたって', en: 'On the occasion of graduation, I wrote a thank-you letter to the teacher.' },
    { jp: '契約を結ぶにあたって、内容をよく読んでください。', cloze: 'にあたって', en: 'When concluding the contract, please read the contents carefully.' },
    ],
  },
  {
    id: 'g099', pattern: '〜わけにはいかない', english: 'cannot; must not (socially or morally impossible)',
    level: 'N2',
    explanation: 'わけにはいかない expresses that one cannot do something for social, moral, or situational reasons — not a physical impossibility, but an obligation-based one.',
    hint: 'Can\'t possibly ~ (social/moral reasons).',
    examples: [
    { jp: '約束したから、行かないわけにはいかない。', cloze: 'わけにはいかない', en: 'Because I made a promise, I can\'t possibly not go.' },
    { jp: 'こんな大切な会議を休むわけにはいかない。', cloze: 'わけにはいかない', en: 'I can\'t possibly miss such an important meeting.' },
    { jp: '病気でも仕事を辞めるわけにはいかない。', cloze: 'わけにはいかない', en: 'Even if I\'m sick, I can\'t just quit my job.' },
    ],
  },
  {
    id: 'g100', pattern: '〜ざるを得ない', english: 'cannot help but; have no choice but to',
    level: 'N2',
    explanation: 'ざるを得ない expresses that one has no choice but to do something — it is unavoidable. It is the classical negative form + を得ない (\'cannot not do\').',
    hint: 'No choice but to ~ (unavoidable).',
    examples: [
    { jp: '証拠があるので、認めざるを得ない。', cloze: 'ざるを得ない', en: 'Since there is evidence, I have no choice but to admit it.' },
    { jp: '状況を考えると、断念せざるを得なかった。', cloze: 'ざるを得なかった', en: 'Considering the situation, I had no choice but to give up.' },
    { jp: '彼の能力は認めざるを得ません。', cloze: 'ざるを得ません', en: 'I cannot help but acknowledge his ability.' },
    ],
  },
  {
    id: 'g101', pattern: '〜に鑑みて', english: 'in light of; considering; taking ~ into account (formal)',
    level: 'N1',
    explanation: 'に鑑みて is a formal expression meaning \'in light of\' or \'taking into account\'. It is used in official documents, speeches, and formal writing when making judgments based on circumstances.',
    hint: 'Formal \'in light of ~\'.',
    examples: [
    { jp: '現在の状況に鑑みて、計画を変更することにしました。', cloze: 'に鑑みて', en: 'In light of the current situation, we decided to change the plan.' },
    { jp: '過去の事例に鑑みて、対策を検討します。', cloze: 'に鑑みて', en: 'Taking past cases into account, we will consider countermeasures.' },
    { jp: '社会の変化に鑑みて、新しい政策が必要です。', cloze: 'に鑑みて', en: 'In light of changes in society, new policies are necessary.' },
    ],
  },
  {
    id: 'g102', pattern: '〜をもって', english: 'with; by means of; as of (formal ending/means)',
    level: 'N1',
    explanation: 'をもって is a formal expression meaning \'by means of\' or \'with\'. It also indicates the point at which something ends or takes effect (\'as of ~\').',
    hint: 'By means of ~; as of ~ (formal).',
    examples: [
    { jp: '本日をもって、この店は閉店いたします。', cloze: 'をもって', en: 'As of today, this store will close.' },
    { jp: '誠意をもって交渉に臨みました。', cloze: 'をもって', en: 'I entered the negotiation with sincerity.' },
    { jp: '以上をもって、式を終了します。', cloze: 'をもって', en: 'With this, we conclude the ceremony.' },
    ],
  },
  {
    id: 'g103', pattern: '〜いかんによらず', english: 'regardless of; irrespective of',
    level: 'N1',
    explanation: 'いかんによらず is a formal expression meaning \'regardless of ~\'. It states that the following applies no matter what the preceding condition or situation is.',
    hint: 'Regardless of ~; no matter what ~.',
    examples: [
    { jp: '理由のいかんによらず、遅刻は認めません。', cloze: 'いかんによらず', en: 'Regardless of the reason, tardiness is not permitted.' },
    { jp: '結果のいかんによらず、最善を尽くします。', cloze: 'いかんによらず', en: 'Regardless of the result, I will do my best.' },
    { jp: '状況のいかんによらず、原則は守られるべきです。', cloze: 'いかんによらず', en: 'Regardless of the situation, principles should be upheld.' },
    ],
  },
  {
    id: 'g104', pattern: '〜をおいて', english: 'apart from; other than; there is no one but',
    level: 'N1',
    explanation: 'をおいて（〜ない/〜ほかにない）is used to say there is no alternative — \'apart from ~, there is none\'. It highlights uniqueness or indispensability.',
    hint: 'No one/nothing else but ~.',
    examples: [
    { jp: 'この仕事は彼をおいてほかにできる人はいない。', cloze: 'をおいて', en: 'There is no one other than him who can do this job.' },
    { jp: '今をおいてこのチャンスはない。', cloze: 'をおいて', en: 'There is no opportunity other than now.' },
    { jp: 'あなたをおいて適任者はいないでしょう。', cloze: 'をおいて', en: 'There is probably no one more suitable than you.' },
    ],
  },
  {
    id: 'g105', pattern: '〜にとどまらず', english: 'not limited to; not stopping at; beyond',
    level: 'N1',
    explanation: 'にとどまらず means \'not limited to ~\' or \'extending beyond ~\'. It indicates that something goes further than the stated scope.',
    hint: 'Not limited to ~; extends beyond ~.',
    examples: [
    { jp: 'この問題は日本にとどまらず、世界規模の問題です。', cloze: 'にとどまらず', en: 'This problem is not limited to Japan; it is a global issue.' },
    { jp: '彼の影響力は音楽にとどまらず、映画にも及んでいる。', cloze: 'にとどまらず', en: 'His influence is not limited to music but extends to film.' },
    { jp: '被害は一部の地域にとどまらず、全国に広がった。', cloze: 'にとどまらず', en: 'The damage was not limited to some areas but spread nationwide.' },
    ],
  },
  {
    id: 'g106', pattern: '〜ならではの', english: 'unique to; only possible with; characteristic of',
    level: 'N1',
    explanation: 'ならではの means \'unique to ~\' or \'possible only with ~\'. It highlights something special that can only be found in or attributed to a particular thing or person.',
    hint: 'Unique to ~; only ~ can offer this.',
    examples: [
    { jp: 'ここならではの自然の美しさがあります。', cloze: 'ならではの', en: 'There is a natural beauty unique to this place.' },
    { jp: '職人ならではの技術が光っています。', cloze: 'ならではの', en: 'The skills unique to craftsmen shine through.' },
    { jp: '子どもならではの発想が面白いです。', cloze: 'ならではの', en: 'The ideas unique to children are interesting.' },
    ],
  },
  {
    id: 'g107', pattern: '〜といえども', english: 'even though; even if; no matter how ~ (concessive)',
    level: 'N1',
    explanation: 'といえども is a formal/literary concessive expression meaning \'even though ~\' or \'no matter how ~\'. It follows nouns or plain-form verbs.',
    hint: 'Even though ~; no matter how ~ (formal).',
    examples: [
    { jp: '専門家といえども、完璧ではない。', cloze: 'といえども', en: 'Even experts are not perfect.' },
    { jp: '少量といえども、毒は毒だ。', cloze: 'といえども', en: 'Even in small amounts, poison is poison.' },
    { jp: '理由があるといえども、暴力は許されない。', cloze: 'といえども', en: 'Even if there is a reason, violence is not permitted.' },
    ],
  },
  {
    id: 'g108', pattern: '〜にほかならない', english: 'nothing but; none other than; is exactly ~',
    level: 'N1',
    explanation: 'にほかならない is a strong assertion meaning \'it is nothing other than ~\'. It emphasizes that the conclusion is exactly and only that thing.',
    hint: 'It is none other than ~.',
    examples: [
    { jp: '彼の成功は努力の結果にほかならない。', cloze: 'にほかならない', en: 'His success is nothing other than the result of hard work.' },
    { jp: 'これは差別にほかならない。', cloze: 'にほかならない', en: 'This is nothing but discrimination.' },
    { jp: 'あなたが助けてくれたのは愛情にほかなりません。', cloze: 'にほかなりません', en: 'The fact that you helped me is none other than love.' },
    ],
  },
  {
    id: 'g109', pattern: '〜ずにはいられない', english: 'cannot help but; cannot resist doing',
    level: 'N1',
    explanation: 'ずにはいられない means one cannot stop oneself from doing something. It is the literary/classical equivalent of てしまう for irresistible impulses.',
    hint: 'Can\'t help but ~; irresistibly compelled to ~.',
    examples: [
    { jp: '彼の話を聞いて、笑わずにはいられなかった。', cloze: 'ずにはいられなかった', en: 'Hearing his story, I couldn\'t help but laugh.' },
    { jp: 'この映画を見て、泣かずにはいられなかった。', cloze: 'ずにはいられなかった', en: 'Watching this film, I couldn\'t help but cry.' },
    { jp: '不公平な扱いに怒らずにはいられない。', cloze: 'ずにはいられない', en: 'I can\'t help but get angry at unfair treatment.' },
    ],
  },
  {
    id: 'g110', pattern: '〜てやまない', english: 'sincerely; earnestly; from the bottom of one\'s heart (strong continuous feeling)',
    level: 'N1',
    explanation: 'てやまない expresses a feeling that does not cease — a deep, unceasing emotion such as hope or love. It is formal and literary.',
    hint: 'Unceasing ~ (deep heartfelt feeling).',
    examples: [
    { jp: 'ご成功を願ってやみません。', cloze: 'てやみません', en: 'I sincerely hope for your success.' },
    { jp: '彼女の回復を祈ってやまない。', cloze: 'てやまない', en: 'I earnestly pray for her recovery.' },
    { jp: '平和を愛してやまない人々が集まりました。', cloze: 'てやまない', en: 'People who earnestly love peace gathered together.' },
    ],
  },
  {
    id: 'g111', pattern: '〜に先立ち', english: 'prior to; before; in advance of',
    level: 'N1',
    explanation: 'に先立ち is a formal expression meaning \'prior to ~\' or \'before ~\'. It indicates something done in preparation or as a precedent to an important event.',
    hint: 'Prior to ~; before ~ (formal preparation).',
    examples: [
    { jp: '式典に先立ち、リハーサルが行われました。', cloze: 'に先立ち', en: 'Prior to the ceremony, a rehearsal was held.' },
    { jp: '発売に先立ち、記者会見が開かれた。', cloze: 'に先立ち', en: 'Before the release, a press conference was held.' },
    { jp: '手術に先立ち、詳細な検査が必要です。', cloze: 'に先立ち', en: 'Prior to the surgery, a detailed examination is necessary.' },
    ],
  },
  {
    id: 'g112', pattern: '〜をよそに', english: 'ignoring; setting aside; despite ~',
    level: 'N1',
    explanation: 'をよそに means \'ignoring ~\' or \'setting aside ~\'. It indicates that someone acts without regard to others\' concerns, expectations, or surrounding circumstances.',
    hint: 'Ignoring ~; setting ~ aside entirely.',
    examples: [
    { jp: '親の心配をよそに、彼は旅に出た。', cloze: 'をよそに', en: 'Ignoring his parents\' worries, he set off on a journey.' },
    { jp: '世間の批判をよそに、彼女は計画を続けた。', cloze: 'をよそに', en: 'Ignoring public criticism, she continued with her plan.' },
    { jp: '混乱をよそに、彼は冷静に対処した。', cloze: 'をよそに', en: 'Setting aside the chaos, he dealt with it calmly.' },
    ],
  },
  {
    id: 'g113', pattern: '〜いかんにかかわらず', english: 'regardless of; no matter what ~ (formal)',
    level: 'N1',
    explanation: 'いかんにかかわらず is a highly formal expression meaning \'regardless of ~\' or \'no matter what the ~ may be\'. It is similar to いかんによらず but even more formal.',
    hint: 'No matter what ~ (highly formal).',
    examples: [
    { jp: '理由のいかんにかかわらず、規則は守ること。', cloze: 'いかんにかかわらず', en: 'Regardless of the reason, the rules must be followed.' },
    { jp: '結果のいかんにかかわらず、誠実に取り組む。', cloze: 'いかんにかかわらず', en: 'No matter the outcome, I will engage sincerely.' },
    { jp: '国籍のいかんにかかわらず、人権は守られます。', cloze: 'いかんにかかわらず', en: 'Human rights are protected regardless of nationality.' },
    ],
  },
  {
    id: 'g114', pattern: '〜とあって', english: 'because of the special circumstance that ~; given that ~',
    level: 'N1',
    explanation: 'とあって indicates a special or unusual circumstance that causes an understandable result. It is used when explaining why something happens due to a noteworthy situation.',
    hint: 'Given the special circumstance that ~.',
    examples: [
    { jp: '連休とあって、観光地は大変混んでいます。', cloze: 'とあって', en: 'Given that it\'s a long holiday, the tourist spots are very crowded.' },
    { jp: '人気アーティストのコンサートとあって、チケットはすぐ売り切れた。', cloze: 'とあって', en: 'Given that it was a popular artist\'s concert, tickets sold out immediately.' },
    { jp: '最後の試合とあって、選手たちは全力を尽くした。', cloze: 'とあって', en: 'Given that it was the final match, the players gave their all.' },
    ],
  },
  {
    id: 'g115', pattern: '〜をものともせず', english: 'undaunted by; in defiance of; without being defeated by',
    level: 'N1',
    explanation: 'をものともせず means \'undaunted by ~\' or \'not being deterred by ~\'. It describes someone who acts boldly despite difficulties or adversity.',
    hint: 'Undaunted by ~; defying ~.',
    examples: [
    { jp: '悪天候をものともせず、登山を続けた。', cloze: 'をものともせず', en: 'Undaunted by the bad weather, they continued climbing.' },
    { jp: '批判をものともせず、改革を進めた。', cloze: 'をものともせず', en: 'Undeterred by criticism, she pushed forward with the reform.' },
    { jp: '怪我をものともせず、最後まで走り抜いた。', cloze: 'をものともせず', en: 'Undaunted by his injury, he ran through to the finish.' },
    ],
  },
  {
    id: 'g116', pattern: '〜てもさしつかえない', english: 'it is fine to; there is no objection to; may ~',
    level: 'N1',
    explanation: 'てもさしつかえない is a formal expression meaning there is no problem or objection with doing something — a polite way of giving permission.',
    hint: 'No objection to ~; it\'s fine to ~.',
    examples: [
    { jp: 'この資料を使用してもさしつかえありません。', cloze: 'てもさしつかえありません', en: 'There is no objection to using this document.' },
    { jp: '明日提出してもさしつかえない。', cloze: 'てもさしつかえない', en: 'It is fine to submit it tomorrow.' },
    { jp: 'ここに座ってもさしつかえありませんか。', cloze: 'てもさしつかえありませんか', en: 'Would it be all right if I sat here?' },
    ],
  },
  {
    id: 'g117', pattern: '〜であれ〜であれ', english: 'whether ~ or ~; regardless of whether ~ or ~',
    level: 'N1',
    explanation: 'であれ〜であれ lists alternatives and states that the conclusion applies regardless of which is the case. \'Whether it is A or B, ...\'.',
    hint: 'Whether ~ or ~, either way ~.',
    examples: [
    { jp: '男であれ女であれ、平等に扱われるべきだ。', cloze: 'であれ', en: 'Whether male or female, they should be treated equally.' },
    { jp: '成功であれ失敗であれ、経験は大切です。', cloze: 'であれ', en: 'Whether success or failure, the experience is valuable.' },
    { jp: '賛成であれ反対であれ、意見を言ってください。', cloze: 'であれ', en: 'Whether you agree or disagree, please share your opinion.' },
    ],
  },
  {
    id: 'g118', pattern: '〜にひきかえ', english: 'in stark contrast to; unlike ~',
    level: 'N1',
    explanation: 'にひきかえ presents a stark contrast between two things. It highlights how different the second item is compared to the first, often with a sense of lament or emphasis.',
    hint: 'In stark contrast to ~.',
    examples: [
    { jp: '兄の努力にひきかえ、弟は全く勉強しない。', cloze: 'にひきかえ', en: 'In stark contrast to his brother\'s efforts, the younger one doesn\'t study at all.' },
    { jp: '昨年の好業績にひきかえ、今年は厳しい結果となった。', cloze: 'にひきかえ', en: 'In stark contrast to last year\'s good results, this year\'s outcome was harsh.' },
    { jp: '外見のよさにひきかえ、中身が伴っていない。', cloze: 'にひきかえ', en: 'In contrast to the appealing exterior, the substance is lacking.' },
    ],
  },
  {
    id: 'g119', pattern: '〜もさることながら', english: '~ goes without saying, but; not only ~, but also',
    level: 'N1',
    explanation: 'もさることながら acknowledges one fact as a given and then introduces another, often more important point. \'Of course ~ is true, but beyond that, ~\'.',
    hint: '~ is a given, but even more so ~.',
    examples: [
    { jp: '味もさることながら、見た目も大切です。', cloze: 'もさることながら', en: 'Not only does taste go without saying, but appearance is also important.' },
    { jp: '技術もさることながら、人柄が重要です。', cloze: 'もさることながら', en: 'Skill goes without saying, but character is important too.' },
    { jp: '費用もさることながら、時間的な問題もある。', cloze: 'もさることながら', en: 'Cost aside, there is also the matter of time.' },
    ],
  },
  {
    id: 'g120', pattern: '〜すら', english: 'even ~ (strong emphasis, often negative)',
    level: 'N1',
    explanation: 'すら is an emphatic particle meaning \'even ~\', highlighting an extreme or unexpected example. It is often used in negative contexts and is more literary than さえ.',
    hint: 'Even ~ (emphatic, often negative).',
    examples: [
    { jp: '彼は名前すら覚えていなかった。', cloze: 'すら', en: 'He didn\'t even remember the name.' },
    { jp: '忙しすぎて、食事をする時間すらない。', cloze: 'すら', en: 'I\'m so busy I don\'t even have time to eat.' },
    { jp: 'その問題は専門家すら解けなかった。', cloze: 'すら', en: 'Even experts couldn\'t solve that problem.' },
    ],
  },
]

export const GRAMMAR_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
export const N5_GRAMMAR = GRAMMAR_DATA.filter(g => g.level === 'N5')
export const N4_GRAMMAR = GRAMMAR_DATA.filter(g => g.level === 'N4')

// Heuristic, not real parsing: a pattern like "〜は〜です" splits into fixed slots ["は", "です"]
// (the 〜 markers stand for whatever fills the blanks) — a sentence "matches" if every slot
// appears in it. A slot can itself list "/"-separated alternatives (e.g. "〜ではありません /
// じゃないです" — either form counts).
//
// Patterns are written in plain/dictionary form (する, ている, できる...) but real sentences
// are very often polite ます-form (します, しています, できます...) — testing against this
// data's own 360 example sentences showed ~30% wouldn't match their own pattern without
// accounting for this, so it's not a rare edge case worth ignoring. Japanese conjugation only
// ever changes trailing kana, never the stem, so for slots of 3+ characters we also accept a
// match on the slot with its last character dropped (e.g. "ている" → "てい" matches inside
// "食べています"). Slots under 3 characters are left exact-only since a 1-character stem
// (e.g. from "する", "ある") would match almost anything.
//
// This still can't distinguish two required slots ("〜は〜です") from two full alternative
// constructions written the same way (e.g. "〜前に / 〜後で" means "before" OR "after", not
// both) — a handful of patterns with two 〜 markers and a "/" fall into that rarer shape and
// may under-match. Accepted, documented heuristic limitations, not exhaustive parsing.
function patternSlots(pattern: string): string[][] {
  return pattern
    .split('〜')
    .map(s => s.trim())
    .filter(Boolean)
    .map(slot => slot.split('/').map(alt => alt.trim()).filter(Boolean))
}

function slotMatches(alts: string[], sentence: string): boolean {
  return alts.some(alt =>
    sentence.includes(alt) || (alt.length >= 3 && sentence.includes(alt.slice(0, -1)))
  )
}

export function matchGrammarPatterns(sentence: string): GrammarPoint[] {
  if (!sentence) return []
  return GRAMMAR_DATA.filter(g => {
    const slots = patternSlots(g.pattern)
    return slots.length > 0 && slots.every(alts => slotMatches(alts, sentence))
  })
}
