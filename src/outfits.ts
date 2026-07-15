import {
  AgeGroup,
  Gender,
  Modesty,
  OutfitRecommendation,
  ShoppingLink,
  StyleChoice,
  TempBand,
  WeatherSnapshot,
} from "./types";

interface OutfitTemplate {
  title: string;
  pieces: string[];
  searchQuery: string;
}

type OutfitMatrix = Record<TempBand, Record<StyleChoice, OutfitTemplate>>;

// "anyGender" covers nonbinary users with gender-neutral silhouettes.
const FEMALE: OutfitMatrix = {
  hot: {
    casual: {
      title: "Breezy summer dress",
      pieces: ["Lightweight cotton or linen sundress", "Flat sandals", "Crossbody bag"],
      searchQuery: "women summer cotton midi dress",
    },
    formal: {
      title: "Cool-touch office set",
      pieces: ["Sleeveless linen blouse", "Wide-leg linen trousers", "Block-heel mules"],
      searchQuery: "women linen blouse wide leg trousers",
    },
    sporty: {
      title: "Hot-day active fit",
      pieces: ["Moisture-wicking tank", "Running shorts or skort", "Breathable trainers", "Cap"],
      searchQuery: "women moisture wicking tank running skort",
    },
    streetwear: {
      title: "Summer street look",
      pieces: ["Oversized graphic tee", "Denim shorts or cargo skirt", "Chunky sneakers"],
      searchQuery: "women oversized graphic tee denim shorts",
    },
    bohemian: {
      title: "Boho sun dress",
      pieces: ["Flowy floral maxi dress", "Woven sandals", "Straw hat"],
      searchQuery: "women boho floral maxi dress",
    },
    traditional: {
      title: "Light ethnic wear",
      pieces: ["Cotton kurti or light saree", "Comfortable flats", "Light dupatta"],
      searchQuery: "women cotton kurti summer",
    },
  },
  warm: {
    casual: {
      title: "Easy warm-day outfit",
      pieces: ["Short-sleeve blouse or tee", "Midi skirt or light chinos", "Sneakers or sandals"],
      searchQuery: "women short sleeve blouse midi skirt",
    },
    formal: {
      title: "Smart spring office",
      pieces: ["Silk-blend shirt", "Tailored ankle trousers", "Loafers or low heels"],
      searchQuery: "women silk shirt tailored ankle trousers",
    },
    sporty: {
      title: "Warm-day training",
      pieces: ["Performance tee", "Capri leggings or shorts", "Running shoes"],
      searchQuery: "women performance tee capri leggings",
    },
    streetwear: {
      title: "Layer-light street",
      pieces: ["Boxy tee", "Wide-leg jeans", "Retro sneakers", "Bucket hat"],
      searchQuery: "women boxy tee wide leg jeans",
    },
    bohemian: {
      title: "Warm boho layers",
      pieces: ["Embroidered blouse", "Tiered midi skirt", "Suede sandals"],
      searchQuery: "women embroidered blouse tiered midi skirt",
    },
    traditional: {
      title: "Everyday ethnic",
      pieces: ["Kurti with palazzo pants", "Juttis or flats", "Light stole"],
      searchQuery: "women kurti palazzo set",
    },
  },
  mild: {
    casual: {
      title: "Light-layer casual",
      pieces: ["Long-sleeve top", "Jeans", "Light cardigan or denim jacket", "Sneakers"],
      searchQuery: "women denim jacket long sleeve top jeans",
    },
    formal: {
      title: "Classic blazer look",
      pieces: ["Fine-knit top", "Tailored trousers", "Unlined blazer", "Pointed flats"],
      searchQuery: "women unlined blazer tailored trousers",
    },
    sporty: {
      title: "Mild-day active",
      pieces: ["Long-sleeve training top", "Full-length leggings", "Light running jacket"],
      searchQuery: "women long sleeve training top leggings",
    },
    streetwear: {
      title: "Hoodie season",
      pieces: ["Cropped or oversized hoodie", "Cargo pants", "High-top sneakers"],
      searchQuery: "women oversized hoodie cargo pants",
    },
    bohemian: {
      title: "Boho with a knit",
      pieces: ["Maxi dress", "Chunky knit cardigan", "Ankle boots"],
      searchQuery: "women chunky knit cardigan maxi dress",
    },
    traditional: {
      title: "Layered ethnic",
      pieces: ["Anarkali or kurti set", "Light shawl", "Closed flats"],
      searchQuery: "women anarkali kurti set",
    },
  },
  cool: {
    casual: {
      title: "Cozy casual layers",
      pieces: ["Sweater", "Jeans or corduroy pants", "Trench or utility jacket", "Boots"],
      searchQuery: "women sweater trench coat jeans",
    },
    formal: {
      title: "Polished cool-weather office",
      pieces: ["Turtleneck knit", "Wool-blend trousers", "Structured coat", "Leather boots"],
      searchQuery: "women turtleneck wool trousers structured coat",
    },
    sporty: {
      title: "Cool-run kit",
      pieces: ["Thermal base layer", "Running tights", "Zip-up midlayer", "Gloves"],
      searchQuery: "women thermal base layer running tights",
    },
    streetwear: {
      title: "Street layers",
      pieces: ["Hoodie under bomber jacket", "Straight-leg jeans", "Chunky sneakers", "Beanie"],
      searchQuery: "women bomber jacket hoodie jeans",
    },
    bohemian: {
      title: "Boho autumn",
      pieces: ["Sweater dress", "Tights", "Long knit coat", "Suede boots"],
      searchQuery: "women sweater dress long knit coat",
    },
    traditional: {
      title: "Warm ethnic layers",
      pieces: ["Kurti with warm leggings", "Pashmina shawl", "Closed shoes"],
      searchQuery: "women kurti pashmina shawl winter",
    },
  },
  cold: {
    casual: {
      title: "Winter casual",
      pieces: ["Thick knit sweater", "Fleece-lined jeans", "Puffer jacket", "Insulated boots", "Scarf"],
      searchQuery: "women puffer jacket knit sweater winter",
    },
    formal: {
      title: "Winter office",
      pieces: ["Merino turtleneck", "Wool trousers", "Long wool coat", "Leather gloves"],
      searchQuery: "women long wool coat merino turtleneck",
    },
    sporty: {
      title: "Cold-weather training",
      pieces: ["Thermal top + fleece", "Winter running tights", "Windproof jacket", "Headband"],
      searchQuery: "women winter running jacket thermal tights",
    },
    streetwear: {
      title: "Winter street",
      pieces: ["Oversized puffer", "Hoodie", "Cargo pants", "Winter sneakers", "Beanie"],
      searchQuery: "women oversized puffer hoodie winter",
    },
    bohemian: {
      title: "Boho winter",
      pieces: ["Knit maxi dress", "Shearling-lined coat", "Tall boots", "Wool scarf"],
      searchQuery: "women knit maxi dress shearling coat",
    },
    traditional: {
      title: "Winter ethnic",
      pieces: ["Woolen kurti or phiran", "Warm churidar", "Heavy shawl", "Boots"],
      searchQuery: "women woolen kurti heavy shawl",
    },
  },
  freezing: {
    casual: {
      title: "Deep-freeze casual",
      pieces: ["Thermal base layer", "Heavy sweater", "Down parka", "Snow boots", "Beanie + gloves + scarf"],
      searchQuery: "women down parka thermal base layer",
    },
    formal: {
      title: "Freezing-day office",
      pieces: ["Thermal layer under knit dress or suit", "Long down coat", "Insulated leather boots", "Wool accessories"],
      searchQuery: "women long down coat wool dress winter",
    },
    sporty: {
      title: "Sub-zero training",
      pieces: ["Heavy thermal layers", "Windproof insulated jacket", "Thermal tights + shell", "Balaclava"],
      searchQuery: "women insulated winter training jacket",
    },
    streetwear: {
      title: "Arctic street",
      pieces: ["Long puffer coat", "Fleece hoodie", "Thermal-lined pants", "Snow sneakers"],
      searchQuery: "women long puffer coat fleece hoodie",
    },
    bohemian: {
      title: "Boho in the snow",
      pieces: ["Layered knit dress", "Maxi puffer or shearling coat", "Fleece tights", "Snow boots"],
      searchQuery: "women maxi puffer coat knit dress",
    },
    traditional: {
      title: "Freezing-day ethnic",
      pieces: ["Heavy phiran or woolen suit", "Thermal innerwear", "Kashmiri shawl", "Lined boots"],
      searchQuery: "women woolen suit kashmiri shawl",
    },
  },
};

const MALE: OutfitMatrix = {
  hot: {
    casual: {
      title: "Hot-day casual",
      pieces: ["Linen or cotton short-sleeve shirt", "Chino shorts", "Canvas sneakers or sandals"],
      searchQuery: "men linen short sleeve shirt chino shorts",
    },
    formal: {
      title: "Summer smart",
      pieces: ["Breathable dress shirt", "Lightweight chinos", "Loafers, no socks show"],
      searchQuery: "men breathable dress shirt lightweight chinos",
    },
    sporty: {
      title: "Hot training kit",
      pieces: ["Dri-fit tee or tank", "Training shorts", "Breathable runners", "Cap"],
      searchQuery: "men dri fit tee training shorts",
    },
    streetwear: {
      title: "Summer street",
      pieces: ["Oversized tee", "Mesh or cargo shorts", "Slides or low-tops"],
      searchQuery: "men oversized tee cargo shorts",
    },
    bohemian: {
      title: "Relaxed boho",
      pieces: ["Open linen shirt over tank", "Drawstring linen pants", "Leather sandals"],
      searchQuery: "men linen shirt drawstring pants",
    },
    traditional: {
      title: "Light ethnic",
      pieces: ["Cotton kurta", "Light pajama or dhoti pants", "Kolhapuri sandals"],
      searchQuery: "men cotton kurta pajama summer",
    },
  },
  warm: {
    casual: {
      title: "Warm-day casual",
      pieces: ["Polo or tee", "Chinos or light jeans", "White sneakers"],
      searchQuery: "men polo shirt chinos",
    },
    formal: {
      title: "Business casual",
      pieces: ["Oxford shirt", "Tailored chinos", "Loafers", "No-tie look"],
      searchQuery: "men oxford shirt tailored chinos loafers",
    },
    sporty: {
      title: "Warm training",
      pieces: ["Performance tee", "Shorts or joggers", "Running shoes"],
      searchQuery: "men performance tee joggers",
    },
    streetwear: {
      title: "Street basics",
      pieces: ["Graphic tee", "Relaxed jeans", "Retro sneakers", "Cap"],
      searchQuery: "men graphic tee relaxed jeans",
    },
    bohemian: {
      title: "Boho layers",
      pieces: ["Patterned shirt", "Loose cotton pants", "Espadrilles"],
      searchQuery: "men patterned shirt loose cotton pants",
    },
    traditional: {
      title: "Everyday ethnic",
      pieces: ["Short kurta", "Jeans or pajama", "Sandals"],
      searchQuery: "men short kurta jeans",
    },
  },
  mild: {
    casual: {
      title: "Light-layer casual",
      pieces: ["Long-sleeve tee or flannel", "Jeans", "Light bomber or denim jacket", "Sneakers"],
      searchQuery: "men flannel shirt denim jacket",
    },
    formal: {
      title: "Blazer weather",
      pieces: ["Dress shirt", "Wool-blend trousers", "Unstructured blazer", "Derbies"],
      searchQuery: "men unstructured blazer dress shirt",
    },
    sporty: {
      title: "Mild-day active",
      pieces: ["Long-sleeve training top", "Joggers", "Light windbreaker"],
      searchQuery: "men windbreaker joggers training",
    },
    streetwear: {
      title: "Hoodie season",
      pieces: ["Hoodie", "Cargo pants", "High-top sneakers"],
      searchQuery: "men hoodie cargo pants streetwear",
    },
    bohemian: {
      title: "Boho with knit",
      pieces: ["Open-knit sweater", "Corduroy pants", "Desert boots"],
      searchQuery: "men open knit sweater corduroy pants",
    },
    traditional: {
      title: "Layered ethnic",
      pieces: ["Kurta with Nehru jacket", "Churidar or jeans", "Mojaris"],
      searchQuery: "men kurta nehru jacket",
    },
  },
  cool: {
    casual: {
      title: "Cool-day layers",
      pieces: ["Crewneck sweater", "Jeans", "Field jacket or mac coat", "Boots"],
      searchQuery: "men crewneck sweater field jacket",
    },
    formal: {
      title: "Cool-weather office",
      pieces: ["Merino sweater over shirt", "Wool trousers", "Topcoat", "Leather boots"],
      searchQuery: "men merino sweater wool topcoat",
    },
    sporty: {
      title: "Cool training",
      pieces: ["Thermal base layer", "Running tights or joggers", "Zip midlayer", "Gloves"],
      searchQuery: "men thermal base layer running",
    },
    streetwear: {
      title: "Street layers",
      pieces: ["Hoodie under coach or bomber jacket", "Straight jeans", "Chunky sneakers", "Beanie"],
      searchQuery: "men bomber jacket hoodie beanie",
    },
    bohemian: {
      title: "Boho autumn",
      pieces: ["Chunky cardigan", "Henley", "Relaxed trousers", "Suede boots"],
      searchQuery: "men chunky cardigan henley",
    },
    traditional: {
      title: "Warm ethnic",
      pieces: ["Kurta with woolen Nehru jacket", "Warm churidar", "Closed shoes"],
      searchQuery: "men woolen nehru jacket kurta",
    },
  },
  cold: {
    casual: {
      title: "Winter casual",
      pieces: ["Heavy knit sweater", "Lined jeans", "Puffer or parka", "Insulated boots", "Scarf"],
      searchQuery: "men puffer parka heavy knit sweater",
    },
    formal: {
      title: "Winter office",
      pieces: ["Turtleneck or shirt + sweater", "Flannel wool trousers", "Long wool overcoat", "Gloves"],
      searchQuery: "men long wool overcoat turtleneck",
    },
    sporty: {
      title: "Cold training",
      pieces: ["Thermal layers", "Winter tights + shell pants", "Insulated running jacket", "Headband"],
      searchQuery: "men insulated running jacket winter",
    },
    streetwear: {
      title: "Winter street",
      pieces: ["Oversized puffer", "Fleece hoodie", "Cargo pants", "Winter sneakers", "Beanie"],
      searchQuery: "men oversized puffer fleece hoodie",
    },
    bohemian: {
      title: "Boho winter",
      pieces: ["Shawl-collar cardigan", "Thermal henley", "Wool pants", "Shearling boots"],
      searchQuery: "men shawl collar cardigan wool pants",
    },
    traditional: {
      title: "Winter ethnic",
      pieces: ["Woolen kurta or phiran", "Thermal innerwear", "Heavy shawl", "Boots"],
      searchQuery: "men woolen kurta winter shawl",
    },
  },
  freezing: {
    casual: {
      title: "Deep-freeze casual",
      pieces: ["Thermal base layer", "Heavy sweater", "Down parka", "Snow boots", "Beanie + gloves + scarf"],
      searchQuery: "men down parka thermal base layer",
    },
    formal: {
      title: "Freezing-day office",
      pieces: ["Thermals under suit", "Heavy wool overcoat", "Insulated dress boots", "Cashmere scarf + gloves"],
      searchQuery: "men heavy wool overcoat suit winter",
    },
    sporty: {
      title: "Sub-zero training",
      pieces: ["Double thermal layers", "Windproof insulated jacket", "Thermal tights + shell", "Balaclava"],
      searchQuery: "men windproof insulated training jacket",
    },
    streetwear: {
      title: "Arctic street",
      pieces: ["Long puffer coat", "Fleece hoodie", "Thermal-lined pants", "Snow sneakers"],
      searchQuery: "men long puffer coat thermal pants",
    },
    bohemian: {
      title: "Boho in the snow",
      pieces: ["Layered knits", "Shearling coat", "Wool pants", "Snow boots"],
      searchQuery: "men shearling coat layered knits",
    },
    traditional: {
      title: "Freezing-day ethnic",
      pieces: ["Heavy phiran or woolen sherwani", "Thermal innerwear", "Pashmina shawl", "Lined boots"],
      searchQuery: "men woolen phiran pashmina shawl",
    },
  },
};

const GIRL: OutfitMatrix = {
  hot: {
    casual: {
      title: "Sunny day sundress",
      pieces: ["Cotton sundress", "Lightweight sandals", "Sun hat"],
      searchQuery: "girls cotton sundress summer",
    },
    formal: {
      title: "Pretty summer dress",
      pieces: ["Floral smock dress", "Mary Jane shoes", "Small hair bow"],
      searchQuery: "girls floral smock dress",
    },
    sporty: {
      title: "Active summer kit",
      pieces: ["Athletic tank", "Shorts", "Supportive sneakers", "Cap"],
      searchQuery: "girls athletic tank shorts",
    },
    streetwear: {
      title: "Cool casual street",
      pieces: ["Graphic tee", "Denim shorts", "Sneakers", "Mini backpack"],
      searchQuery: "girls graphic tee denim shorts",
    },
    bohemian: {
      title: "Boho summer look",
      pieces: ["Flowy tiered skirt", "Cropped tank", "Sandals", "Headband"],
      searchQuery: "girls boho tiered skirt tank",
    },
    traditional: {
      title: "Festive ethnic",
      pieces: ["Cotton lehenga or salwar kameez", "Sandals", "Light dupatta"],
      searchQuery: "girls cotton salwar kameez summer",
    },
  },
  warm: {
    casual: {
      title: "Breezy warm-day outfit",
      pieces: ["Short-sleeve top", "Skirt or shorts", "Canvas sneakers"],
      searchQuery: "girls short sleeve top skirt",
    },
    formal: {
      title: "Smart warm-day look",
      pieces: ["Puff-sleeve blouse", "Pleated skirt", "Ballet flats"],
      searchQuery: "girls puff sleeve blouse pleated skirt",
    },
    sporty: {
      title: "Warm-day play kit",
      pieces: ["Performance tee", "Bike shorts or joggers", "Running shoes"],
      searchQuery: "girls performance tee bike shorts",
    },
    streetwear: {
      title: "Casual street style",
      pieces: ["Oversized tee", "Leggings", "High-top sneakers"],
      searchQuery: "girls oversized tee leggings",
    },
    bohemian: {
      title: "Boho warm layers",
      pieces: ["Embroidered top", "Midi skirt", "Espadrilles"],
      searchQuery: "girls embroidered top midi skirt",
    },
    traditional: {
      title: "Everyday ethnic",
      pieces: ["Cotton kurti", "Churidar", "Sandals"],
      searchQuery: "girls cotton kurti churidar",
    },
  },
  mild: {
    casual: {
      title: "Light-layer casual",
      pieces: ["Long-sleeve top", "Jeans or jeggings", "Light cardigan", "Sneakers"],
      searchQuery: "girls long sleeve top cardigan jeans",
    },
    formal: {
      title: "Smart mild-day outfit",
      pieces: ["Ruffled blouse", "Tailored trousers", "Mary Janes"],
      searchQuery: "girls ruffled blouse tailored trousers",
    },
    sporty: {
      title: "Active mild day",
      pieces: ["Long-sleeve athletic top", "Leggings", "Light zip jacket"],
      searchQuery: "girls long sleeve athletic top leggings",
    },
    streetwear: {
      title: "Hoodie casual",
      pieces: ["Hoodie", "Jogger pants", "Chunky sneakers"],
      searchQuery: "girls hoodie jogger pants",
    },
    bohemian: {
      title: "Boho knit layers",
      pieces: ["Knit cardigan", "Midi dress", "Ankle boots"],
      searchQuery: "girls knit cardigan midi dress",
    },
    traditional: {
      title: "Layered ethnic",
      pieces: ["Kurti set with light shawl", "Leggings", "Closed flats"],
      searchQuery: "girls kurti set shawl",
    },
  },
  cool: {
    casual: {
      title: "Cosy cool-day outfit",
      pieces: ["Sweater", "Jeans", "Utility jacket", "Ankle boots"],
      searchQuery: "girls sweater utility jacket jeans",
    },
    formal: {
      title: "Polished cool look",
      pieces: ["Knit turtleneck", "Pleated skirt", "Tights", "Mary Janes"],
      searchQuery: "girls turtleneck pleated skirt tights",
    },
    sporty: {
      title: "Cool training kit",
      pieces: ["Thermal top", "Running tights", "Zip midlayer", "Gloves"],
      searchQuery: "girls thermal top running tights",
    },
    streetwear: {
      title: "Layered street style",
      pieces: ["Hoodie", "Bomber jacket", "Straight-leg jeans", "Sneakers", "Beanie"],
      searchQuery: "girls bomber jacket hoodie jeans",
    },
    bohemian: {
      title: "Autumn boho",
      pieces: ["Sweater dress", "Tights", "Long knit cardi", "Ankle boots"],
      searchQuery: "girls sweater dress knit cardigan",
    },
    traditional: {
      title: "Warm ethnic layers",
      pieces: ["Kurta with warm leggings", "Pashmina shawl", "Closed shoes"],
      searchQuery: "girls kurta pashmina shawl",
    },
  },
  cold: {
    casual: {
      title: "Winter casual",
      pieces: ["Knit sweater", "Fleece-lined leggings", "Puffer jacket", "Boots", "Scarf"],
      searchQuery: "girls puffer jacket knit sweater winter",
    },
    formal: {
      title: "Winter dress-up",
      pieces: ["Velvet dress", "Tights", "Warm coat", "Dress boots"],
      searchQuery: "girls velvet dress winter coat",
    },
    sporty: {
      title: "Cold-weather active",
      pieces: ["Thermal top + fleece", "Winter tights", "Windproof jacket", "Headband"],
      searchQuery: "girls winter running jacket thermal tights",
    },
    streetwear: {
      title: "Winter street",
      pieces: ["Oversized puffer", "Hoodie", "Cargo pants", "Winter sneakers", "Beanie"],
      searchQuery: "girls oversized puffer hoodie winter",
    },
    bohemian: {
      title: "Boho winter",
      pieces: ["Knit maxi dress", "Shearling-lined coat", "Tall boots", "Wool scarf"],
      searchQuery: "girls knit maxi dress shearling coat",
    },
    traditional: {
      title: "Winter ethnic",
      pieces: ["Woolen kurti", "Warm churidar", "Heavy shawl", "Boots"],
      searchQuery: "girls woolen kurti heavy shawl",
    },
  },
  freezing: {
    casual: {
      title: "Deep-freeze casual",
      pieces: ["Thermal base layer", "Heavy sweater", "Down parka", "Snow boots", "Beanie + gloves + scarf"],
      searchQuery: "girls down parka thermal base layer",
    },
    formal: {
      title: "Freezing-day dressed-up",
      pieces: ["Thermal layer under dress", "Long down coat", "Insulated boots", "Wool accessories"],
      searchQuery: "girls long down coat dress winter",
    },
    sporty: {
      title: "Sub-zero active",
      pieces: ["Heavy thermal layers", "Windproof insulated jacket", "Thermal tights + shell", "Balaclava"],
      searchQuery: "girls insulated winter training jacket",
    },
    streetwear: {
      title: "Arctic street",
      pieces: ["Long puffer coat", "Fleece hoodie", "Thermal-lined pants", "Snow sneakers"],
      searchQuery: "girls long puffer coat fleece hoodie",
    },
    bohemian: {
      title: "Boho in the snow",
      pieces: ["Layered knit dress", "Maxi puffer coat", "Fleece tights", "Snow boots"],
      searchQuery: "girls maxi puffer coat knit dress",
    },
    traditional: {
      title: "Freezing-day ethnic",
      pieces: ["Heavy woolen suit", "Thermal innerwear", "Kashmiri shawl", "Lined boots"],
      searchQuery: "girls woolen suit kashmiri shawl",
    },
  },
};

const BOY: OutfitMatrix = {
  hot: {
    casual: {
      title: "Hot-day casual",
      pieces: ["Lightweight cotton tee", "Shorts", "Canvas sneakers or sandals"],
      searchQuery: "boys cotton tee shorts summer",
    },
    formal: {
      title: "Smart summer look",
      pieces: ["Short-sleeve button-up shirt", "Chino shorts", "Loafers"],
      searchQuery: "boys button up shirt chino shorts",
    },
    sporty: {
      title: "Hot training kit",
      pieces: ["Moisture-wicking tee", "Training shorts", "Breathable sneakers", "Cap"],
      searchQuery: "boys moisture wicking tee training shorts",
    },
    streetwear: {
      title: "Summer street",
      pieces: ["Oversized graphic tee", "Cargo shorts", "Low-top sneakers"],
      searchQuery: "boys oversized graphic tee cargo shorts",
    },
    bohemian: {
      title: "Relaxed casual",
      pieces: ["Printed short-sleeve shirt", "Drawstring shorts", "Sandals"],
      searchQuery: "boys printed shirt drawstring shorts",
    },
    traditional: {
      title: "Light ethnic",
      pieces: ["Cotton kurta", "Pyjama pants", "Sandals"],
      searchQuery: "boys cotton kurta pyjama summer",
    },
  },
  warm: {
    casual: {
      title: "Warm-day casual",
      pieces: ["Polo shirt", "Chinos or light jeans", "White sneakers"],
      searchQuery: "boys polo shirt chinos",
    },
    formal: {
      title: "Smart casual",
      pieces: ["Oxford shirt", "Slim chinos", "Loafers"],
      searchQuery: "boys oxford shirt slim chinos",
    },
    sporty: {
      title: "Warm training",
      pieces: ["Performance tee", "Shorts or joggers", "Running shoes"],
      searchQuery: "boys performance tee joggers",
    },
    streetwear: {
      title: "Street basics",
      pieces: ["Graphic tee", "Relaxed jeans", "Retro sneakers", "Cap"],
      searchQuery: "boys graphic tee relaxed jeans",
    },
    bohemian: {
      title: "Boho casual",
      pieces: ["Patterned shirt", "Loose cotton pants", "Espadrilles"],
      searchQuery: "boys patterned shirt loose cotton pants",
    },
    traditional: {
      title: "Everyday ethnic",
      pieces: ["Short kurta", "Jeans or pyjama", "Sandals"],
      searchQuery: "boys short kurta jeans",
    },
  },
  mild: {
    casual: {
      title: "Light-layer casual",
      pieces: ["Long-sleeve tee or flannel", "Jeans", "Light bomber jacket", "Sneakers"],
      searchQuery: "boys flannel shirt bomber jacket jeans",
    },
    formal: {
      title: "Blazer weather",
      pieces: ["Dress shirt", "Chino trousers", "Unstructured blazer", "Oxford shoes"],
      searchQuery: "boys blazer dress shirt chinos",
    },
    sporty: {
      title: "Mild-day active",
      pieces: ["Long-sleeve training top", "Joggers", "Light windbreaker"],
      searchQuery: "boys windbreaker joggers training",
    },
    streetwear: {
      title: "Hoodie season",
      pieces: ["Hoodie", "Cargo pants", "High-top sneakers"],
      searchQuery: "boys hoodie cargo pants streetwear",
    },
    bohemian: {
      title: "Boho with knit",
      pieces: ["Open-knit sweater", "Corduroy pants", "Desert boots"],
      searchQuery: "boys open knit sweater corduroy pants",
    },
    traditional: {
      title: "Layered ethnic",
      pieces: ["Kurta with Nehru jacket", "Churidar or jeans", "Sandals"],
      searchQuery: "boys kurta nehru jacket",
    },
  },
  cool: {
    casual: {
      title: "Cool-day layers",
      pieces: ["Crewneck sweater", "Jeans", "Field jacket", "Boots"],
      searchQuery: "boys crewneck sweater field jacket",
    },
    formal: {
      title: "Cool-weather smart",
      pieces: ["Merino sweater over shirt", "Chino trousers", "Wool coat", "Leather boots"],
      searchQuery: "boys merino sweater wool coat",
    },
    sporty: {
      title: "Cool training",
      pieces: ["Thermal base layer", "Joggers", "Zip midlayer", "Gloves"],
      searchQuery: "boys thermal base layer joggers",
    },
    streetwear: {
      title: "Street layers",
      pieces: ["Hoodie under bomber jacket", "Straight jeans", "Chunky sneakers", "Beanie"],
      searchQuery: "boys bomber jacket hoodie beanie",
    },
    bohemian: {
      title: "Boho autumn",
      pieces: ["Chunky cardigan", "Henley top", "Relaxed trousers", "Boots"],
      searchQuery: "boys chunky cardigan henley",
    },
    traditional: {
      title: "Warm ethnic",
      pieces: ["Kurta with woolen Nehru jacket", "Warm churidar", "Closed shoes"],
      searchQuery: "boys woolen nehru jacket kurta",
    },
  },
  cold: {
    casual: {
      title: "Winter casual",
      pieces: ["Heavy knit sweater", "Lined jeans", "Puffer jacket", "Insulated boots", "Scarf"],
      searchQuery: "boys puffer jacket knit sweater winter",
    },
    formal: {
      title: "Winter smart",
      pieces: ["Turtleneck or shirt + sweater", "Wool trousers", "Long wool coat", "Gloves"],
      searchQuery: "boys long wool coat turtleneck",
    },
    sporty: {
      title: "Cold training",
      pieces: ["Thermal layers", "Winter tights + shell pants", "Insulated jacket", "Headband"],
      searchQuery: "boys insulated jacket winter thermal",
    },
    streetwear: {
      title: "Winter street",
      pieces: ["Oversized puffer", "Fleece hoodie", "Cargo pants", "Winter sneakers", "Beanie"],
      searchQuery: "boys oversized puffer fleece hoodie",
    },
    bohemian: {
      title: "Boho winter",
      pieces: ["Shawl-collar cardigan", "Thermal henley", "Wool pants", "Snow boots"],
      searchQuery: "boys shawl collar cardigan wool pants",
    },
    traditional: {
      title: "Winter ethnic",
      pieces: ["Woolen kurta", "Thermal innerwear", "Heavy shawl", "Boots"],
      searchQuery: "boys woolen kurta winter shawl",
    },
  },
  freezing: {
    casual: {
      title: "Deep-freeze casual",
      pieces: ["Thermal base layer", "Heavy sweater", "Down parka", "Snow boots", "Beanie + gloves + scarf"],
      searchQuery: "boys down parka thermal base layer",
    },
    formal: {
      title: "Freezing-day smart",
      pieces: ["Thermals under shirt + sweater", "Heavy wool coat", "Insulated boots", "Cashmere scarf + gloves"],
      searchQuery: "boys heavy wool coat thermal winter",
    },
    sporty: {
      title: "Sub-zero active",
      pieces: ["Double thermal layers", "Windproof insulated jacket", "Thermal tights + shell", "Balaclava"],
      searchQuery: "boys windproof insulated jacket thermal",
    },
    streetwear: {
      title: "Arctic street",
      pieces: ["Long puffer coat", "Fleece hoodie", "Thermal-lined pants", "Snow sneakers"],
      searchQuery: "boys long puffer coat thermal pants",
    },
    bohemian: {
      title: "Boho in the snow",
      pieces: ["Layered knits", "Shearling coat", "Wool pants", "Snow boots"],
      searchQuery: "boys shearling coat layered knits",
    },
    traditional: {
      title: "Freezing-day ethnic",
      pieces: ["Heavy phiran or woolen sherwani", "Thermal innerwear", "Pashmina shawl", "Lined boots"],
      searchQuery: "boys woolen phiran pashmina shawl",
    },
  },
};

// Modesty adjustments: swaps and additions applied on top of the base outfit.
function applyModesty(
  template: OutfitTemplate,
  modesty: Modesty,
  band: TempBand
): OutfitTemplate {
  if (modesty === "relaxed") return template;

  const pieces = template.pieces.map((piece) => {
    let p = piece;
    if (modesty === "high") {
      p = p
        .replace(/sleeveless/gi, "Full-sleeve")
        .replace(/tank( top)?/gi, "long-sleeve top")
        .replace(/shorts or skort/gi, "full-length leggings")
        .replace(/denim shorts or cargo skirt/gi, "wide-leg jeans")
        .replace(/chino shorts/gi, "lightweight chinos")
        .replace(/mesh or cargo shorts/gi, "lightweight track pants")
        .replace(/training shorts/gi, "lightweight track pants")
        .replace(/shorts or joggers/gi, "joggers")
        .replace(/running shorts/gi, "lightweight running pants")
        .replace(/midi skirt/gi, "maxi skirt")
        .replace(/midi dress/gi, "maxi dress");
    } else {
      // moderate: lengthen the shortest items, keep the rest
      p = p
        .replace(/running shorts or skort/gi, "knee-length running shorts")
        .replace(/denim shorts/gi, "knee-length denim shorts")
        .replace(/sleeveless/gi, "Short-sleeve");
    }
    return p;
  });

  const additions: string[] = [];
  if (modesty === "high") {
    const warmBands: TempBand[] = ["hot", "warm", "mild"];
    if (warmBands.includes(band)) {
      additions.push("Light overshirt, duster, or open abaya-style layer");
      additions.push("Optional headscarf / hijab in a breathable fabric");
    } else {
      additions.push("Optional headscarf / hijab in a warm fabric");
    }
  }
  return { ...template, pieces: [...pieces, ...additions] };
}

function weatherAdjustments(weather: WeatherSnapshot): string[] {
  const extras: string[] = [];
  if (weather.isRainy || weather.precipitationProbability >= 50) {
    extras.push("Waterproof jacket or compact umbrella");
    extras.push("Water-resistant footwear");
  }
  if (weather.isSnowy) {
    extras.push("Waterproof snow boots with grip");
  }
  if (weather.isWindy) {
    extras.push("Windproof outer layer");
  }
  if (weather.band === "hot") {
    extras.push("Sunglasses + SPF 30+ sunscreen");
  }
  return extras;
}

const STYLE_TERMS: Record<StyleChoice, string> = {
  casual: "casual outfit",
  formal: "business formal outfit",
  sporty: "activewear outfit",
  streetwear: "streetwear outfit",
  bohemian: "boho outfit",
  traditional: "ethnic wear outfit",
};

function buildShoppingLinks(query: string, modesty: Modesty): ShoppingLink[] {
  const q = modesty === "high" ? `modest ${query}` : query;
  const encoded = encodeURIComponent(q);
  return [
    {
      label: "Compare prices on Google Shopping",
      url: `https://www.google.com/search?tbm=shop&q=${encoded}`,
      note: "Best for comparing prices across all stores",
    },
    {
      label: "Amazon — lowest price first",
      url: `https://www.amazon.com/s?k=${encoded}&s=price-asc-rank`,
      note: "Sorted cheapest to most expensive",
    },
    {
      label: "Budget picks on H&M",
      url: `https://www2.hm.com/en_us/search-results.html?q=${encoded}`,
      note: "Affordable fast-fashion option",
    },
  ];
}

export function recommendOutfit(
  weather: WeatherSnapshot,
  gender: Gender,
  style: StyleChoice,
  modesty: Modesty,
  ageGroup?: AgeGroup
): OutfitRecommendation {
  let matrix: OutfitMatrix;
  if (gender === "girl") {
    matrix = GIRL;
  } else if (gender === "boy") {
    matrix = BOY;
  } else if (gender === "female") {
    matrix = FEMALE;
  } else {
    // male and nonbinary use the MALE matrix; nonbinary gets "unisex" prefix below
    matrix = MALE;
  }

  const base = matrix[weather.band][style];
  const adjusted = applyModesty(base, modesty, weather.band);

  let searchQuery = adjusted.searchQuery;
  if (gender === "nonbinary") {
    searchQuery = searchQuery.replace(/^(men|women) /, "unisex ");
  } else if ((gender === "girl" || gender === "boy") && ageGroup) {
    searchQuery = searchQuery.replace(/^(girls|boys) /, `${ageGroup} ${gender === "girl" ? "girl" : "boy"} `);
  }

  const roundedTemp = Math.round(weather.feelsLikeC);
  return {
    title: adjusted.title,
    summary: `Feels like ${roundedTemp}°C with ${weather.condition.toLowerCase()} — ${adjusted.title.toLowerCase()} works best today.`,
    pieces: adjusted.pieces,
    accessories: weatherAdjustments(weather),
    // Same query the shopping links use, plus a style term, so the photos
    // match both the chosen style and the actual recommended pieces.
    imageQuery: `${modesty === "high" ? "modest " : ""}${searchQuery} ${STYLE_TERMS[style]}`,
    shoppingLinks: buildShoppingLinks(searchQuery, modesty),
  };
}
