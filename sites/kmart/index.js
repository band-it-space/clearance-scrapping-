// import {processLinks} from './helper/getAllBrands.js'
// import {fetchProductLinks} from './helper/getAllItems.js'
// import {scrapeWithScrapingBee} from "./helper/scrapeWithScrapingBee.js";
// import {processCategories} from "../../addons/process-categories.js";
// import {cacheDerivedGTIN, restoreDerivedGTIN} from "../../addons/cache-data.js";
// import {addToGTINQueue, processGTINQueue} from "../../addons/search-gtin.js";
import {overwriteGoogleSheet} from "./../../google-sheets/overwrite-data.js";

const SHEET_ID = "1o90_r9tc8QO-xI1npfAMD4G7voK6joCmfo6Nmy9vwzE";

const categories = [
    { "Home & Living Clearance": "https://www.kmart.com.au/category/home-and-living/home-and-living-clearance/"},
    { "Womens Clearance": "https://www.kmart.com.au/category/women/womens-clearance/" },
    { "Mens Clearance": "https://www.kmart.com.au/category/men/mens-clearance/" },
    { "Kids & Baby Clearance": "https://www.kmart.com.au/category/kids-and-baby/kids-and-baby-clearance/" },
    { "Toys Clearance": "https://www.kmart.com.au/category/toys/toys-clearance/" },
    { "Clearance Beauty": "https://www.kmart.com.au/category/women/clearance-beauty/" },
    { "Sports Clearance": "https://www.kmart.com.au/category/sport-and-outdoor/sports-clearance/" },
    { "Technology Clearance": "https://www.kmart.com.au/category/tech/technology-clearance/" },
    { "Online Exclusives Clearance": "https://www.kmart.com.au/category/online-exclusives/online-exclusives-clearance/" },
];

(async () => {
    const allItems = [
        {
            "URL": "https://example.com/product-1",
            "Store Name": "TechShop",
            "Product SKU": "TS1001",
            "Product Name": "Wireless Headphones",
            "Product Brand": "SoundMax",
            "Original Price": "150.00",
            "Sale Price": "99.99",
            "Current Price first seen on": "01/06/2025",
            "Current price last seen on": "04/06/2025",
            "Description": "High-quality wireless headphones with noise cancellation.",
            "Specification": "Bluetooth 5.0, 20h battery, USB-C charging",
            "Images": "https://example.com/images/product-1.jpg",
            "Original store Category": "Electronics > Audio",
            "RRP?": "Yes"
        },
        {
            "URL": "https://example.com/product-2",
            "Store Name": "HomePlus",
            "Product SKU": "HP2002",
            "Product Name": "Blender Pro 5000",
            "Product Brand": "KitchenTech",
            "Original Price": "120.00",
            "Sale Price": "89.00",
            "Current Price first seen on": "30/05/2025",
            "Current price last seen on": "04/06/2025",
            "Description": "Powerful blender suitable for smoothies, soups and more.",
            "Specification": "500W motor, 1.5L jug, stainless steel blades",
            "Images": "https://example.com/images/product-2.jpg",
            "Original store Category": "Home & Kitchen > Appliances",
            "RRP?": "No"
        },
        {
            "URL": "https://example.com/product-3",
            "Store Name": "GadgetWorld",
            "Product SKU": "GW3030",
            "Product Name": "Smartwatch X10",
            "Product Brand": "TechWear",
            "Original Price": "199.99",
            "Sale Price": "149.99",
            "Current Price first seen on": "28/05/2025",
            "Current price last seen on": "04/06/2025",
            "Description": "Multifunctional smartwatch with fitness tracking and notifications.",
            "Specification": "Heart rate monitor, GPS, waterproof, AMOLED screen",
            "Images": "https://example.com/images/product-3.jpg",
            "Original store Category": "Wearables",
            "RRP?": "Yes"
        }
    ];


    // await fetchProductLinks(categories)

    // const uniqueItems = await processCategories(allItems,
    //     // [{
    //     //     Category: 'Maquillage',
    //     //     'Category Link': 'https://www.sephora.fr/shop/maquillage-c302/',
    //     //     Products: [
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/hd-skin-perfecting-pressed-powder-%E2%80%93-poudre-pressee-ultra-floutante-imperceptible-P10061607.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/bloom-palette---palette-de-fards-a-paupiere-P1000206199.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/spray-fixateur-de-maquillage---tenue-16h--1-.-sans-transfert-P10023031.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/badgal-bounce-voluminizing-mascara-P10061529.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/surrealskin%E2%84%A2-soft-setting-spray---spray-fixateur-P10061429.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/lash-idole-flutter-extension---mascara-longueur-extreme-P1000205561.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/lights--camera--lashes%E2%84%A2-platinum-mascara---mascara-P10061299.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/fluff-et-fix-brow-wax---cire-sourcils-texturisante-et-fixante-P10059943.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/airbrush-setting-spray---spray-fixateur-de-maquillage-P10018525.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/airbrush-setting-spray---spray-fixateur-de-maquillage-P10018525.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/cc-red-correct---soin-illuminateur-correcteur-rougeur-P3455023.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/cc-red-correct---soin-illuminateur-correcteur-rougeur-P3455023.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mist-et-fix-spray---brume-fixatrice-P10047979.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/you-mist---spray-fixateur-maquillage-P10061478.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/instant-bronzing-drops---gouttes-bronzantes-P10061564.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/cc-creme-a-la-centella-asiatica-P1293015.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/cc-creme-a-la-centella-asiatica-P1293015.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/soft-pinch---liquid-blush-in-hope-P10053951.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/soft-pinch---liquid-blush-in-hope-P10053951.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/soft-pinch---liquid-blush-in-hope-P10053951.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/soft-pinch---liquid-blush-in-hope-P10053951.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/hella-thicc---volumizing-mascara-P10049348.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/hella-thicc---volumizing-mascara-P10049348.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/hd-skin-perfecting-loose-powder-%E2%80%93-poudre-libre-ultra-floutante-imperceptible-P10061605.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mascara-volume-effet-faux-cils---coffret-cadeau-femme-P1000205999.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/hd-skin-face-essentials---palette-teint-P10053928.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/badgal-bang----mascara-volume-renversant---P3228024.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/badgal-bang----mascara-volume-renversant---P3228024.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/badgal-bang----mascara-volume-renversant---P3228024.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/badgal-bang----mascara-volume-renversant---P3228024.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mega-mix-palette---mega-palette-de-teintes-P10061352.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mega-mix-palette---mega-palette-de-teintes-P10061352.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mega-mix-palette---mega-palette-de-teintes-P10061352.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/mega-mix-palette---mega-palette-de-teintes-P10061352.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/lash-clash---mascara-volume-extreme-P10024132.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/lash-clash---mascara-volume-extreme-P10024132.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/lash-clash---mascara-volume-extreme-P10024132.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/make-it-bronze---bronzer-en-stick-P10055782.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/make-it-bronze---bronzer-en-stick-P10055782.html",
    //     //         "https://www.sephora.fr/https://www.sephora.fr/p/make-it-bronze---bronzer-en-stick-P10055782.html",
    //     //     ]
    //     // }],
    //     false, false);
    //
    // const itemsData = await scrapeWithScrapingBee(uniqueItems
    //     // [
    //     //     {
    //     //         Category: 'Parfum',
    //     //         'Category Link': 'https://www.sephora.fr/shop/parfum-c301/',
    //     //         Products: [
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/miss-dior-parfum-roller-pearl-P10060517.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/atelier-des-fleurs-orchidee-de-minuit----eau-de-parfum-P10060549.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/la-panthere-elixir---eau-de-parfum-intense-P1000204975.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p-Kayali_Mix_Match_Bundle_Trio_Sparkling_Lychee_Juicy_Apple_Pistachio_Gelato.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/s%C3%AC-passione---eau-de-parfum-intense-P1000203470.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/coffret-decouverte-blu-mediterraneo---eau-de-toilette-P10017893.html'
    //     //         ]
    //     //     },
    //     //     {
    //     //         Category: 'Maquillage',
    //     //         'Category Link': 'https://www.sephora.fr/shop/maquillage-c302/',
    //     //         Products: [
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/charlotte-s-magic-water-cream-P10052795.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/veil-translucent-setting-powder---poudre-fixante-translucide-P3381008.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/size-up---mascara-volume-extra-large-immediat---format-voyage-P3950141.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/eponge-multi-textures---eponge-maquillage-P3814099.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/on-the-glow-blush---baton-hydratant-teinte-P4122090.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/luxury-palette-the-rebel---palette-de-fards-a-paupieres-504414.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/pout-preserve-peptide-lip-treatment-P10047536.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/pro-brow-definer---crayon-a-sourcils-P1000203188.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/gimme-brow---le-mascara-pour-sourcils-P2578001.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/maracuja-juicy-lip---gloss-P10013538.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/pro-filt-r---fond-de-teint-poudre-mat-P10013140.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/soft-pinch-set---mini-coffret-levres-et-joues-P10061422.html',
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/small-eye-shadow---fard-a-paupieres-P10023645.html'
    //     //         ]
    //     //     },
    //     //     {
    //     //         Category: 'Soin Visage',
    //     //         'Category Link': 'https://www.sephora.fr/shop/soin-visage-c303/',
    //     //         Products: [
    //     //             'https://www.sephora.fr/https://www.sephora.fr/p/facial-fuel-energizing-scrub---exfoliant-visage-energisant-pour-homme-P10011693.html'
    //     //         ]
    //     //     }
    //     // ]
    //     // [
    //     //     {
    //     //         Category: 'Parfum',
    //     //         'Category Link': 'https://www.sephora.fr/shop/parfum-c301/',
    //     //         Products: [
    //     //             'https://www.sephora.fr/p/libre---eau-de-parfum-P3800005.html'
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/miss-dior-parfum---notes-fleuries--fruitees-et-boisees-intenses-P1000202930.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/dior-homme-parfum---notes-ambrees--boisees-et-fleuries-P10061496.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/aqua-allegoria-rosa-verde---eau-de-toilette-P1000206012.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/miss-dior-parfum-mini-miss-parfum-solide---parfum-en-stick-sans-alcool-P10061499.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/coco-mademoiselle---eau-de-parfum-P96042.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/kayali-vanilla-28---eau-de-parfum-P3551017.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/bleu-de-chanel---eau-de-parfum-P1922003.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/yum-boujee-marshmallow--81---eau-de-parfum-intense-P10061050.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p/brazilian-crush-body-fragrance-mist---brume-parfumee-pour-le-corps-P3347006.html',
    //     //             // 'https://www.sephora.fr/https://www.sephora.fr/p-sdj_Duo_Brumes_Parfumees.html',
    //     //         ]
    //     //     },
    //     // ]
    // )



    await overwriteGoogleSheet(SHEET_ID, allItems)
})()
