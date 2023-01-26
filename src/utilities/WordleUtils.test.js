import * as WordleUtils from './WordleUtils';
import * as WordleDict from '../data/dictionaries/Wordle'
// import { english3 } from '../data/dictionaries/English'

beforeAll(() => {
  WordleUtils.initWordleIndexPartitions();
  // WordleUtils.initDataLists();
})

test('WordUtils.wordle properly reduces wordlist', () => {
  const picks = WordleUtils.wordlePicks;
  let words;
  
  words = WordleUtils.wordle(picks, 'l-a-t-e-r?_g-i-r?l-y=_d-r?o?l-l-');
  expect(words.length).toEqual(1);
  expect(words[0]).toEqual("rocky");
  words = WordleUtils.wordle(picks, 'l-a?t-e-r-_g-i?r-l-y-_d-r-o-l-l-_r-o-c-k-y-_q-u-a?s=i?_s?w-a?m?i?_s?p-i=c-e-');
  expect(words.length).toEqual(1);
  expect(words[0]).toEqual("amiss");
  words = WordleUtils.wordle(picks, 'l?a-t-e-r?_g-i-r?l=y-');
  expect(words.length).toEqual(1);
  expect(words[0]).toEqual("droll");
  words = WordleUtils.wordle(picks, 'l-a-t?e?r-_e?x-i=s=t=');
  expect(words.length).toEqual(1);
  expect(words[0]).toEqual("heist");
  words = WordleUtils.wordle(picks, 'r-a-i-s/e-_s=n/o=u-t-');
  expect(words.length).toEqual(3);
  expect(words).toEqual(["shown", "spoon", "swoon"]);
  words = WordleUtils.wordle(picks, 'a/l/t=e=r=');
  expect(words.length).toEqual(1);
  expect(words[0]).toEqual("later");
  words = WordleUtils.wordle(picks, 'c-r-a-n-e/_s-l-e/e-t/');
  expect(words.length).toEqual(11);
  expect(words).toContain("depth");
  words = WordleUtils.wordle(picks, 's/l-e-e=t-');
  expect(words.length).toEqual(10);
  expect(words).toContain("askew");
  expect(words).toContain("riser");
  words = WordleUtils.wordle(picks, 'o-t/t-e/r/');
  expect(words).toContain("trace");
  expect(words).not.toContain("treat");
  words = WordleUtils.wordle(picks, 't-r=a-c-e/_d-e-f-e=r/');
  expect(words).toContain("gruel");
  expect(words).not.toContain("green");
  expect(words.length).toEqual(1);
})

test('WordUtils.unique finds words with all unique letters properly', () => {
  let words = WordleUtils.wordlePicks;
  let uniqueLetterWords = WordleUtils.unique(words);
  let expected = [ 
    "abhor", "abide", "abled", "abode", "abort", "about", "above", "abuse", "acorn", "acrid", "actor", "acute", "adept", "admin", "admit", "adobe", "adopt", "adore", "adorn", "adult", "afire", "afoul", "after", "agent", "agile", "aglow", "agony", "aider", "aisle", "album", "alert", "alien", "align", "alike", "alive", "aloft", "alone", "along", "aloud", "alter", "amber", "amble", "amend", "amity", "among", "ample", "amply", "amuse", "angel", "anger", "angle", "angry", "angst", "anime", "ankle", "anode", "antic", "anvil", "aphid", "aping", "apron", "aptly", "argue", "arise", "arose", "arson", "artsy", "ascot", "ashen", "aside", "askew", "atone", "audio", "audit", "aunty", "avert", "avoid", "awful", "awoke", "axiom", "axion", "azure", "bacon", "badge", "badly", "bagel", "baker", "baler", "balmy", "banjo", "barge", "baron", "basic", "basil", "basin", "baste", "batch", "bathe", "baton", "bawdy", "bayou", "beach", "beady", "beard", "beast", "befit", "began", "begat", "begin", "begun", "being", "belch", "below", "bench", "berth", "bicep", "bigot", "bilge", "binge", "bingo", "biome", "birch", "birth", "bison", "black", "blade", "blame", "bland", "blank", "blare", "blast", "blaze", "bleak", "bleat", "blend", "blimp", "blind", "blink", "blitz", "bloat", "block", "bloke", "blond", "blown", "bluer", "blunt", "blurt", "blush", "board", "boast", "boney", "bonus", "borax", "borne", "botch", "bough", "boule", "bound", "bowel", "boxer", "brace", "braid", "brain", "brake", "brand", "brash", "brave", "bravo", "brawl", "brawn", "bread", "break", "brick", "bride", "brief", "brine", "bring", "brink", "briny", "brisk", "broad", "broil", "broke", "broth", "brown", "brunt", "brush", "brute", "budge", "bugle", "build", "built", "bulge", "bulky", "bunch", "burly", "burnt", "burst", "bused", "bushy", "butch", "buxom", "buyer", "bylaw", "cabin", "cable", "cadet", "cagey", "cairn", "camel", "cameo", "candy", "canoe", "caper", "caput", "cargo", "carol", "carve", "caste", "cater", "caulk", "cause", "cavil", "cedar", "chafe", "chain", "chair", "chalk", "champ", "chant", "chaos", "chard", "charm", "chart", "chase", "chasm", "cheap", "cheat", "chest", "chide", "chief", "child", "chime", "china", "chirp", "choir", "choke", "chord", "chore", "chose", "chump", "chunk", "churn", "chute", "cider", "cigar", "claim", "clamp", "clang", "clank", "clash", "clasp", "clean", "clear", "cleat", "cleft", "clerk", "climb", "cling", "clink", "cloak", "clone", "close", "cloth", "cloud", "clout", "clove", "clown", "clued", "clump", "clung", "coast", "cobra", "comet", "comfy", "copse", "coral", "corny", "cough", "could", "count", "coupe", "court", "coven", "cover", "covet", "covey", "cower", "craft", "cramp", "crane", "crank", "crash", "crate", "crave", "crawl", "craze", "crazy", "creak", "cream", "credo", "crept", "crest", "cried", "crime", "crimp", "crisp", "croak", "crone", "crony", "croup", "crowd", "crown", "crude", "cruel", "crumb", "crump", "crush", "crust", "crypt", "cumin", "curio", "curly", "curse", "curve", "curvy", "cutie", "cyber", "daily", "dairy", "daisy", "dance", "datum", "daunt", "dealt", "death", "debar", "debit", "debug", "debut", "decal", "decay", "decor", "decoy", "decry", "deign", "deity", "delay", "delta", "demon", "demur", "denim", "depot", "depth", "derby", "detox", "devil", "diary", "dicey", "dimly", "diner", "dingo", "dingy", "dirge", "dirty", "disco", "ditch", "diver", "dogma", "doing", "donut", "dopey", "doubt", "dough", "dowel", "downy", "dowry", "dozen", "draft", "drain", "drake", "drank", "drape", "drawl", "drawn", "dream", "drift", "drink", "drive", "droit", "drone", "drove", "drown", "drunk", "duchy", "dumpy", "dunce", "dusky", "dusty", "dutch", "duvet", "dwarf", "dwelt", "dying", "early", "earth", "ebony", "eclat", "edict", "edify", "eight", "eking", "elbow", "elfin", "email", "empty", "enact", "endow", "enjoy", "entry", "envoy", "epoch", "epoxy", "equal", "equip", "erupt", "ethic", "ethos", "evict", "exact", "exalt", "exist", "extol", "extra", "exult", "eying", "fable", "facet", "faint", "fairy", "faith", "false", "fancy", "farce", "fault", "favor", "feast", "fecal", "feign", "felon", "femur", "feral", "fetal", "fetch", "fetid", "fetus", "fiber", "fibre", "ficus", "field", "fiend", "fiery", "fight", "filer", "filet", "filmy", "filth", "final", "finch", "finer", "first", "fishy", "fixer", "fjord", "flack", "flair", "flake", "flaky", "flame", "flank", "flare", "flash", "flask", "fleck", "flesh", "flick", "flier", "fling", "flint", "flirt", "float", "flock", "flora", "flour", "flout", "flown", "fluid", "fluke", "flume", "flung", "flunk", "flush", "flute", "flyer", "foamy", "focal", "focus", "foist", "foray", "force", "forge", "forte", "forth", "forty", "forum", "found", "foyer", "frail", "frame", "frank", "fraud", "freak", "fresh", "fried", "frisk", "fritz", "frock", "frond", "front", "frost", "froth", "frown", "froze", "fruit", "fudge", "fungi", "funky", "gaily", "gamer", "gamut", "gaudy", "gaunt", "gauze", "gavel", "gawky", "gayer", "gazer", "gecko", "ghost", "ghoul", "giant", "gipsy", "girly", "girth", "given", "giver", "glade", "gland", "glare", "glaze", "gleam", "glean", "glide", "glint", "gloat", "globe", "glory", "glove", "glyph", "gnash", "gnome", "godly", "golem", "gonad", "goner", "gourd", "grace", "grade", "graft", "grail", "grain", "grand", "grant", "grape", "graph", "grasp", "grate", "grave", "gravy", "graze", "great", "grief", "grime", "grimy", "grind", "gripe", "groan", "groin", "grope", "group", "grout", "grove", "growl", "grown", "gruel", "grunt", "guard", "guest", "guide", "guild", "guile", "guilt", "guise", "gulch", "gumbo", "gusto", "gusty", "habit", "hairy", "halve", "handy", "hardy", "harem", "harpy", "haste", "hasty", "hater", "haunt", "haute", "haven", "havoc", "hazel", "heady", "heard", "heart", "heavy", "hefty", "heist", "helix", "heron", "hinge", "hoard", "hoist", "homer", "honey", "horde", "horny", "horse", "hotel", "hotly", "hound", "house", "hovel", "hover", "howdy", "human", "humid", "humor", "hunky", "husky", "hydro", "hyena", "hymen", "hyper", "ideal", "idler", "image", "imbue", "impel", "imply", "inbox", "incur", "index", "inept", "inert", "infer", "ingot", "inlay", "inlet", "input", "inter", "intro", "irate", "irony", "islet", "itchy", "ivory", "jaunt", "jerky", "joint", "joist", "joker", "joust", "judge", "juice", "juicy", "jumbo", "jumpy", "junta", "junto", "knave", "knead", "knelt", "knife", "labor", "laden", "lager", "lance", "lanky", "lapse", "large", "latch", "later", "lathe", "laugh", "layer", "leach", "leafy", "leaky", "leant", "leapt", "learn", "leash", "least", "lefty", "lemon", "lemur", "light", "liken", "limbo", "liner", "lingo", "lithe", "liver", "loamy", "loath", "locus", "lodge", "lofty", "logic", "login", "loser", "louse", "lousy", "lover", "lower", "lucid", "lucky", "lumen", "lumpy", "lunar", "lunch", "lunge", "lurch", "lurid", "lusty", "lying", "lymph", "lynch", "lyric", "macho", "macro", "madly", "magic", "maize", "major", "maker", "mange", "mango", "mangy", "manic", "manly", "manor", "maple", "march", "marsh", "mason", "match", "matey", "mauve", "maybe", "mayor", "mealy", "meant", "meaty", "medal", "media", "medic", "melon", "mercy", "merit", "metal", "metro", "micro", "midge", "midst", "might", "milky", "mince", "miner", "minor", "minty", "minus", "mirth", "miser", "mocha", "modal", "model", "mogul", "moist", "molar", "moldy", "money", "month", "moral", "morph", "motel", "motif", "moult", "mound", "mount", "mourn", "mouse", "mouth", "mover", "movie", "mower", "mucky", "mulch", "munch", "mural", "murky", "mushy", "music", "musky", "musty", "nadir", "naive", "nasty", "navel", "neigh", "nerdy", "newly", "nicer", "niche", "night", "noble", "nobly", "noise", "noisy", "nomad", "north", "nosey", "notch", "novel", "nudge", "nurse", "nymph", "oaken", "ocean", "octal", "often", "olden", "older", "olive", "ombre", "omega", "onset", "opera", "opine", "opium", "optic", "orbit", "organ", "other", "ought", "ounce", "outer", "ovary", "ovate", "overt", "ovine", "owing", "owner", "oxide", "paint", "paler", "palsy", "panel", "panic", "pansy", "parse", "party", "paste", "pasty", "patch", "patio", "patsy", "pause", "payer", "peach", "pearl", "pecan", "pedal", "penal", "perch", "peril", "perky", "pesky", "pesto", "petal", "phase", "phone", "phony", "piano", "picky", "piety", "pilot", "pinch", "piney", "pinky", "pinto", "pique", "pitch", "pithy", "pivot", "pixel", "place", "plaid", "plain", "plait", "plane", "plank", "plant", "plate", "plead", "pleat", "plied", "plier", "pluck", "plumb", "plume", "plunk", "plush", "poesy", "point", "poise", "poker", "polar", "polka", "porch", "poser", "posit", "pouch", "pound", "pouty", "power", "prank", "prawn", "price", "prick", "pride", "pried", "prime", "primo", "print", "prism", "privy", "prize", "probe", "prone", "prong", "prose", "proud", "prove", "prowl", "proxy", "prude", "prune", "psalm", "pubic", "pudgy", "pulse", "punch", "purge", "purse", "pushy", "quack", "quail", "quake", "qualm", "quark", "quart", "quash", "quasi", "query", "quest", "quick", "quiet", "quilt", "quirk", "quite", "quota", "quote", "quoth", "rabid", "radio", "rainy", "raise", "ralph", "ramen", "ranch", "randy", "range", "rapid", "raspy", "ratio", "raven", "rayon", "reach", "react", "ready", "realm", "rebus", "rebut", "recap", "recut", "refit", "regal", "rehab", "reign", "relax", "relay", "relic", "remit", "renal", "repay", "reply", "resin", "retch", "rhino", "rhyme", "ridge", "rifle", "right", "rinse", "ripen", "risen", "risky", "rival", "rivet", "roach", "roast", "robin", "rocky", "rogue", "rouge", "rough", "round", "rouse", "route", "rowdy", "royal", "rugby", "rumba", "rusty", "sadly", "safer", "saint", "salon", "salty", "salve", "salvo", "sandy", "saner", "satin", "satyr", "sauce", "saucy", "saute", "savor", "savoy", "scald", "scale", "scalp", "scaly", "scamp", "scant", "scare", "scarf", "scary", "scent", "scion", "scold", "scone", "scope", "score", "scorn", "scour", "scout", "scowl", "scram", "scrap", "screw", "scrub", "scrum", "scuba", "sedan", "sepia", "serif", "serum", "setup", "shack", "shade", "shady", "shaft", "shake", "shaky", "shale", "shalt", "shame", "shank", "shape", "shard", "share", "shark", "sharp", "shave", "shawl", "shear", "sheik", "shelf", "shied", "shift", "shine", "shiny", "shire", "shirk", "shirt", "shoal", "shock", "shone", "shore", "shorn", "short", "shout", "shove", "shown", "showy", "shrew", "shrub", "shrug", "shuck", "shunt", "sight", "sigma", "silky", "since", "sinew", "singe", "siren", "sixth", "sixty", "skate", "skier", "skimp", "skirt", "slack", "slain", "slang", "slant", "slate", "slave", "slept", "slice", "slick", "slide", "slime", "slimy", "sling", "slink", "slope", "sloth", "slump", "slung", "slunk", "slurp", "smack", "smart", "smear", "smelt", "smile", "smirk", "smite", "smith", "smock", "smoke", "smoky", "smote", "snack", "snail", "snake", "snaky", "snare", "snarl", "sneak", "snide", "snipe", "snore", "snort", "snout", "snowy", "snuck", "soapy", "sober", "solar", "solid", "solve", "sonar", "sonic", "sound", "south", "sower", "space", "spade", "spank", "spare", "spark", "spawn", "speak", "spear", "speck", "spelt", "spend", "spent", "sperm", "spice", "spicy", "spied", "spiel", "spike", "spiky", "spilt", "spine", "spiny", "spire", "spite", "splat", "split", "spoil", "spoke", "spore", "sport", "spout", "spray", "sprig", "spunk", "spurn", "spurt", "squad", "squat", "squib", "stack", "stage", "staid", "stain", "stair", "stake", "stale", "stalk", "stamp", "stand", "stank", "stare", "stark", "stave", "stead", "steak", "steal", "steam", "stein", "stern", "stick", "sting", "stink", "stock", "stoic", "stoke", "stole", "stomp", "stone", "stony", "store", "stork", "storm", "story", "stove", "strap", "straw", "stray", "strip", "stuck", "study", "stump", "stung", "stunk", "style", "suave", "sugar", "suing", "suite", "sulky", "sumac", "super", "surge", "surly", "swami", "swamp", "swarm", "swath", "swear", "sweat", "swept", "swift", "swine", "swing", "swirl", "sword", "swore", "sworn", "swung", "synod", "syrup", "table", "tacky", "taken", "taker", "talon", "tamer", "tango", "tangy", "taper", "tapir", "tardy", "tawny", "teach", "teary", "tempo", "tenor", "tepid", "thank", "their", "thick", "thief", "thing", "think", "third", "thong", "thorn", "those", "threw", "throb", "throw", "thrum", "thumb", "thump", "thyme", "tidal", "tiger", "tilde", "timer", "tipsy", "today", "token", "tonal", "tonga", "tonic", "topaz", "topic", "torch", "torus", "touch", "tough", "towel", "tower", "toxic", "toxin", "trace", "track", "trade", "trail", "train", "tramp", "trash", "trawl", "tread", "trend", "triad", "trial", "tribe", "trice", "trick", "tried", "tripe", "trope", "trove", "truce", "truck", "truly", "trump", "trunk", "tubal", "tuber", "tulip", "tumor", "tunic", "turbo", "twang", "tweak", "twice", "twine", "twirl", "tying", "ulcer", "ultra", "umbra", "uncle", "under", "unfed", "unfit", "unify", "unite", "unity", "unlit", "unmet", "unset", "untie", "until", "unwed", "unzip", "upset", "urban", "urine", "usage", "usher", "using", "utile", "vague", "valet", "valid", "valor", "value", "vapid", "vapor", "vault", "vaunt", "vegan", "venom", "verso", "vicar", "video", "vigor", "vinyl", "viola", "viper", "viral", "virus", "visor", "vista", "vital", "vixen", "vocal", "vodka", "vogue", "voice", "voila", "vomit", "voter", "vouch", "vowel", "vying", "wacky", "wafer", "wager", "wagon", "waist", "waive", "waltz", "warty", "waste", "watch", "water", "waver", "waxen", "weary", "weigh", "weird", "welch", "welsh", "wench", "whack", "whale", "wharf", "wheat", "whelp", "while", "whine", "whiny", "whirl", "whisk", "white", "whole", "whose", "widen", "wider", "width", "wield", "wight", "wimpy", "wince", "winch", "windy", "wiser", "wispy", "witch", "woken", "woman", "women", "wordy", "world", "worse", "worst", "worth", "would", "wound", "woven", "wrack", "wrath", "wreak", "wreck", "wrest", "wring", "wrist", "write", "wrong", "wrote", "wrung", "yacht", "yearn", "yeast", "yield", "young", "youth", "zebra", "zesty", "zonal"
  ];
  expect(uniqueLetterWords).toEqual(expected);
  words = [
    "a", "aa", "ab", "abc", "aaa", "abb", "abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyzz", "aabcdefghijklmnopqrstuvwxyz", "abcdefghijklmmnopqrstuvwxyz"
  ];
  uniqueLetterWords = WordleUtils.unique(words);
  expected = ["a", "ab", "abc", "abcdefghijklmnopqrstuvwxyz"];
  expect(uniqueLetterWords).toEqual(expected);
})

test('WordUtils.matches finds words that match regex string properly', () => {
  let words = WordleUtils.wordlePicks;
  let matchedWords = WordleUtils.matches(words, "[^a^e^i^o^u]{5}");
  let expected = [ 
    "crypt", "dryly", "glyph", "gypsy", "lymph", "lynch", "myrrh", "nymph", "pygmy", "shyly", "slyly", "tryst", "wryly", 
  ];
  expect(matchedWords).toEqual(expected);
  words = [
    "a", "aa", "ab", "abc", "aaa", "abb", "xyz", "abcdefghijklmnopqrstuvwxyz", "abcdefghijklmnopqrstuvwxyzz", "aabcdefghijklmnopqrstuvwxyz", "abcdefghijklmmnopqrstuvwxyz"
  ];
  matchedWords = WordleUtils.matches(words, "xyz$");
  expected = ["xyz", "abcdefghijklmnopqrstuvwxyz", "aabcdefghijklmnopqrstuvwxyz", "abcdefghijklmmnopqrstuvwxyz"];
  expect(matchedWords).toEqual(expected);
})

test('WordUtils.getWordleClues gets clues properly', () => {
  let expected = 'enene';
  let clues = WordleUtils.getWordleClues("abcde", "axcxe");
  expect(clues).toEqual(expected);
  expected = 'epepe';
  clues = WordleUtils.getWordleClues("abcde", "adcbe");
  expect(clues).toEqual(expected);
  expected = 'nnnnn';
  clues = WordleUtils.getWordleClues("abcde", "vwxyz");
  expect(clues).toEqual(expected);
  expected = 'ppppp';
  clues = WordleUtils.getWordleClues("abcde", "bcdea");
  expect(clues).toEqual(expected);
  expected = 'ennnn';
  clues = WordleUtils.getWordleClues("abcde", "aaaaa");
  expect(clues).toEqual(expected);
  expected = 'pnnnn';
  clues = WordleUtils.getWordleClues("eaaaa", "beeee");
  expect(clues).toEqual(expected);
  expected = 'npnnn';
  clues = WordleUtils.getWordleClues("abbbb", "beeee");
  expect(clues).toEqual(expected);
  expected = 'pnnnp';
  clues = WordleUtils.getWordleClues("abbba", "eaeae");
  expect(clues).toEqual(expected);
  expected = 'npnpn';
  clues = WordleUtils.getWordleClues("eaeae", "abbba");
  expect(clues).toEqual(expected);
  expected = 'epppp';
  clues = WordleUtils.getWordleClues("eaeae", "eeaea");
  expect(clues).toEqual(expected);
  expected = 'npnpp';
  clues = WordleUtils.getWordleClues("aecde", "edebd");
  expect(clues).toEqual(expected);
  expected = 'pppnn';
  clues = WordleUtils.getWordleClues("edebd", "aecde");
  expect(clues).toEqual(expected);
})

test('WordleUtils.getWordleDisplayStats works properly', () => {
  const wordInfo = {
    "wordSets": [
        [
            "cease",
            "chafe",
            "chase",
            "scale"
        ],
        [
            "beefy",
            "begin",
            "begun",
            "being",
            "belly",
            "below",
            "bevel",
            "bezel",
            "bleed",
            "bleep",
            "blend",
            "bless",
            "boney",
            "bowel",
            "bused",
            "debug",
            "deign",
            "demon",
            "denim",
            "devil",
            "dopey",
            "dowel",
            "dozen",
            "dwell",
            "ebony",
            "edify",
            "eking",
            "elbow",
            "elegy",
            "elfin",
            "embed",
            "endow",
            "enemy",
            "enjoy",
            "ennui",
            "envoy",
            "epoxy",
            "equip",
            "expel",
            "eying",
            "feign",
            "felon",
            "field",
            "fiend",
            "flesh",
            "geeky",
            "given",
            "golem",
            "gooey",
            "guess",
            "helix",
            "hello",
            "honey",
            "hovel",
            "hymen",
            "impel",
            "index",
            "jelly",
            "jewel",
            "kneed",
            "kneel",
            "leggy",
            "lemon",
            "level",
            "libel",
            "liken",
            "linen",
            "lumen",
            "melon",
            "model",
            "modem",
            "money",
            "needy",
            "neigh",
            "newly",
            "nosey",
            "novel",
            "olden",
            "penny",
            "pesky",
            "piney",
            "pixel",
            "plied",
            "poesy",
            "queen",
            "quell",
            "seedy",
            "semen",
            "seven",
            "sheen",
            "sheep",
            "sheik",
            "shelf",
            "shell",
            "shied",
            "sinew",
            "sleek",
            "sleep",
            "smell",
            "speed",
            "spell",
            "spend",
            "spied",
            "spiel",
            "sweep",
            "swell",
            "unfed",
            "unwed",
            "venom",
            "video",
            "vixen",
            "vowel",
            "weedy",
            "weigh",
            "welsh",
            "wheel",
            "whelp",
            "widen",
            "wield",
            "woken",
            "women",
            "woven",
            "yield"
        ],
        [
            "biddy",
            "billy",
            "bingo",
            "bison",
            "blimp",
            "blind",
            "blink",
            "bliss",
            "blond",
            "blood",
            "bloom",
            "blown",
            "bluff",
            "blush",
            "bobby",
            "bongo",
            "bonus",
            "booby",
            "boozy",
            "bosom",
            "bossy",
            "bough",
            "bound",
            "buddy",
            "buggy",
            "build",
            "bulky",
            "bully",
            "bunny",
            "bushy",
            "buxom",
            "dilly",
            "dimly",
            "dingo",
            "dingy",
            "dizzy",
            "dodgy",
            "doing",
            "dolly",
            "dough",
            "dowdy",
            "downy",
            "dully",
            "dummy",
            "dumpy",
            "dusky",
            "dying",
            "filly",
            "filmy",
            "fishy",
            "fizzy",
            "fling",
            "flood",
            "floss",
            "flown",
            "fluff",
            "fluid",
            "flung",
            "flunk",
            "flush",
            "foggy",
            "folio",
            "folly",
            "found",
            "fully",
            "fungi",
            "funky",
            "funny",
            "fussy",
            "fuzzy",
            "ghoul",
            "giddy",
            "gipsy",
            "gloom",
            "gloss",
            "glyph",
            "godly",
            "going",
            "golly",
            "goody",
            "goofy",
            "guild",
            "gully",
            "gumbo",
            "gummy",
            "guppy",
            "gypsy",
            "hilly",
            "hippo",
            "hippy",
            "hobby",
            "holly",
            "hound",
            "howdy",
            "humid",
            "humph",
            "humus",
            "hunky",
            "husky",
            "hussy",
            "idiom",
            "idyll",
            "igloo",
            "imply",
            "inbox",
            "jiffy",
            "jolly",
            "jumbo",
            "jumpy",
            "kinky",
            "kiosk",
            "knoll",
            "known",
            "limbo",
            "lingo",
            "lipid",
            "livid",
            "lobby",
            "login",
            "loopy",
            "lousy",
            "lowly",
            "lumpy",
            "lupus",
            "lying",
            "lymph",
            "milky",
            "minim",
            "minus",
            "missy",
            "mogul",
            "moldy",
            "moody",
            "mossy",
            "mound",
            "muddy",
            "mummy",
            "mushy",
            "musky",
            "ninny",
            "nobly",
            "noisy",
            "nylon",
            "nymph",
            "oddly",
            "onion",
            "opium",
            "ovoid",
            "owing",
            "phony",
            "piggy",
            "pinky",
            "plumb",
            "plump",
            "plunk",
            "plush",
            "polyp",
            "poppy",
            "pound",
            "pudgy",
            "puffy",
            "pulpy",
            "pupil",
            "puppy",
            "pushy",
            "pygmy",
            "quill",
            "shiny",
            "shook",
            "shown",
            "showy",
            "shush",
            "shyly",
            "silky",
            "silly",
            "sissy",
            "skiff",
            "skill",
            "skimp",
            "skulk",
            "skull",
            "skunk",
            "slimy",
            "sling",
            "slink",
            "sloop",
            "slosh",
            "slump",
            "slung",
            "slunk",
            "slush",
            "slyly",
            "smoky",
            "sniff",
            "snoop",
            "snowy",
            "snuff",
            "soggy",
            "solid",
            "sound",
            "spiky",
            "spill",
            "spiny",
            "spoil",
            "spoof",
            "spook",
            "spool",
            "spoon",
            "spunk",
            "squib",
            "suing",
            "sulky",
            "sully",
            "sunny",
            "sushi",
            "swill",
            "swing",
            "swish",
            "swoon",
            "swoop",
            "swung",
            "synod",
            "undid",
            "unify",
            "union",
            "unzip",
            "using",
            "vigil",
            "vinyl",
            "vivid",
            "vying",
            "whiff",
            "whiny",
            "whisk",
            "whoop",
            "widow",
            "willy",
            "wimpy",
            "windy",
            "wispy",
            "woody",
            "wooly",
            "woozy",
            "would",
            "wound",
            "young"
        ],
        []
    ],
    "wordSetIndex": 0,
    "combinedBoardIndexStrings": [
        "1",
        "2",
        "3,4",
        "4"
    ],
    "wordCount": 373
}
  const sortOrder = [
    {
        "index": "avgGroupSize",
        "decending": true
    },
    {
        "index": "maxGroupSize",
        "decending": true
    },
    {
        "index": "word",
        "decending": true
    },
    {
        "index": "clues",
        "decending": true
    },
    {
        "index": "cluesGroupCount",
        "decending": true
    },
    {
        "index": "boardGroup",
        "decending": true
    }
]
  const stats = WordleUtils.getWordleDisplayStats(wordInfo, sortOrder);
  expect(stats[0].word).toEqual("loins");
  expect(stats[0].numberOfGroups).toEqual(115);
  expect(stats[0].maxGroupSize).toEqual(16);
  expect(stats.length).toBeGreaterThanOrEqual(wordInfo.wordCount);
})

test('WordUtils.filterWordleIndexPartitions works properly', () => {
  // TBD
})
// wip, getting heap overflows when attempting to use the generated file data
test.skip('create WordleData file', () => {
    // generate a ts file that holds all the initial wordle partion data
    let data = "// generated file, do not edit\n\n";
    WordleUtils.initWordleIndexPartitions();
    expect(WordleUtils.cluesLookUpTable).not.toBeFalsy();
    const wordCount = WordleUtils.wordleAllNums.length;
    data += "export let cluesLookUpTable;\n";
    data += "export let groupSizesByClues;\n";
    data += "export let groupCounts;\n"
    data += "export let groupMaxSizes;\n";
    data += "export const wordleDataInit = () => {\n"
    data += "cluesLookUpTable = [\n";
    for (let i = 0; i < wordCount; i++) {
      data += `new Uint16Array([${WordleUtils.cluesLookUpTable[i].toString()}]),\n`
    }
    data += "];\n"
    data += "groupSizesByClues = [\n";
    for (let i = 0; i < wordCount; i++) {
      data += `new Uint16Array([${WordleUtils.groupSizesByClues[i].toString()}]),\n`
    }
    data += "];\n"
    data += `groupCounts = new Uint16Array([${WordleUtils.groupCounts.toString()}]);\n`
    data += `groupMaxSizes = new Uint16Array([${WordleUtils.groupMaxSizes.toString()}]);\n`;
    data += `}\n`;
  
  
    require('fs').writeFile(
  
      './WordleData.js',
      data,
      function (err) {
          if (err) {
              console.error('failed to write WordleData');
          }
      }
    )
});


