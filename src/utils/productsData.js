
const productsData = [
  // Smartphones
  {
    id: 101,
    name: "iPhone 15 Pro",
    price: 120000,
    image: "https://m.media-amazon.com/images/I/81fxjeu8fdL._AC_UY327_FMwebp_QL65_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/81fxjeu8fdL._AC_UY327_FMwebp_QL65_.jpg",
      "https://m.media-amazon.com/images/I/712CBkmhLhL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/617JW0DrG8L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/51brdXeugJL._SL1500_.jpg"
    ],
    category: "Smartphones",
    brand: "Apple",
    color: "Black",
    rating: 4.9,
    inStock: true,
    stock: 10,
    isOffer: false,
    isBestSeller: true,
    badge: "Best Seller",
    description: "Apple iPhone 15 Pro, 256GB, A17 Pro chip, Black Titanium."
  },
  {
    id: 102,
    name: "Redmi Note 13 Pro",
    price: 24999,
    image: "https://m.media-amazon.com/images/I/51Qfyn4vOjL._SX300_SY300_QL70_FMwebp_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/51Qfyn4vOjL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://www.renderhub.com/rever-art/xiaomi-redmi-note-13-pro-arctic-white/xiaomi-redmi-note-13-pro-arctic-white-14.jpg",
      "https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc3/20redminote13header.jpg"
    ],
    category: "Smartphones",
    brand: "Xiaomi",
    color: "Arctic White",
    rating: 4.5,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
    badge: "Offer",
    description: "Redmi Note 13 Pro, 8GB RAM, 256GB, 200MP Camera, Blue."
  },
  {
    id: 103,
    name: "Realme 13 Pro+",
    price: 28999,
    image: "https://m.media-amazon.com/images/I/819sWoSDFRL._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/819sWoSDFRL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/812xRWL2E+L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Wnn1eYpDL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/819gwhFz3ML._SL1500_.jpg"
    ],
    category: "Smartphones",
    brand: "Realme",
    color: "Gold",
    rating: 4.3,
    inStock: false,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Realme 12 Pro+, 12GB RAM, 256GB, Periscope Camera, Gold."
  },
  // Smartwatches
  {
    id: 104,
    name: "Samsung Galaxy Watch 6",
    price: 24999,
    image: "https://m.media-amazon.com/images/I/41Q+MNft5ML._SY300_SX300_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/41Q+MNft5ML._SY300_SX300_.jpg",
      "https://m.media-amazon.com/images/I/71HKLAmV6SL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/811RIOYTm0L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61JIwdYEzDL._SL1500_.jpg"
    ],
    category: "Smartwatches",
    brand: "Samsung",
    color: "Silver",
    rating: 4.7,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
    badge: "Offer",
    description: "Galaxy Watch 6 with AMOLED display, health tracking, GPS."
  },
  {
    id: 105,
    name: "Noise ColorFit Ultra 3",
    price: 3499,
     image: "https://m.media-amazon.com/images/I/71Vx928Yx2L._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Vx928Yx2L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/51uH7hHuW0L.jpg",
      "https://m.media-amazon.com/images/I/71ct56zQMvL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61SLYhGdgiL._SL1500_.jpg"
    ],
    category: "Smartwatches",
    brand: "Noise",
    color: "Black",
    rating: 4.4,
    inStock: true,
    isOffer: true,
    isBestSeller: true,
    badge: "Best Seller",
    description: "ColorFit Ultra 3 with 1.96” AMOLED Display, 100+ Sports Modes."
  },
  {
    id: 106,
    name: "Amazfit GTS 4",
    price: 12999,
    image: "https://in.amazfit.com/cdn/shop/files/GTS_4.jpg?v=1701612237&width=1500",
    images: [
      "https://in.amazfit.com/cdn/shop/files/GTS_4.jpg?v=1701612237&width=1500",
      "https://in.amazfit.com/cdn/shop/products/71grDiNQCkL_SL1500-sw.jpg?v=1701612242&width=823",
      "https://in.amazfit.com/cdn/shop/products/B0BBFXVWWGPT05-sw.png?v=1701612247&width=823",
      "https://in.amazfit.com/cdn/shop/products/PP_df2e98df-adb5-490f-a43e-6b44bd00ef1a-sw.png?v=1701612249&width=823"
    ],
    category: "Smartwatches",
    brand: "Amazfit",
    color: "Gray",
    rating: 4.2,
    inStock: false,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Amazfit GTS 4, 1.75” AMOLED, Alexa Built-in, Gray."
  },
  // Tablets
  {
    id: 107,
    name: "OnePlus Pad",
    price: 37999,
    image: "https://m.media-amazon.com/images/I/31V3lrjd9YL._SX300_SY300_QL70_FMwebp_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/31V3lrjd9YL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/513AOBO-8eL._SX522_.jpg",
      "https://m.media-amazon.com/images/I/51S19gkEn-L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/41jTOS3CX2L._SL1500_.jpg"
    ],
    category: "Tablets",
    brand: "OnePlus",
    color: "Green",
    rating: 4.5,
    inStock: true,
    isOffer: false,
    isBestSeller: true,
    badge: "Best Seller",
    description: "OnePlus Pad Go 28.85Cm 2.4K 7:5 Ratio Readfit Eye Care LCD Display,Dolby Atmos Quad Speakers,4G LTE(Calling) ."
  },
  {
    id: 108,
    name: "Lenovo Tab M10",
    price: 15999,
    image: "https://m.media-amazon.com/images/I/41RKNvYIsbL._SX300_SY300_QL70_FMwebp_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/41RKNvYIsbL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/617ZXE-782L._SL1080_.jpg",
      "https://m.media-amazon.com/images/I/61ljQSZ6VSL._SL1080_.jpg",
      "https://m.media-amazon.com/images/I/61ZoWES+l6L._SL1080_.jpg"
    ],
    category: "Tablets",
    brand: "Lenovo",
    color: "White",
    rating: 4.1,
    inStock: true,
    isOffer: true,
    isBestSeller: false,
    badge: "Offer",
    description: "Lenovo Tab M10, 10.1-inch FHD, 4GB RAM, 64GB, White."
  },
  {
    id: 109,
    name: "Oppo Pad Air",
    price: 18999,
    image: "https://m.media-amazon.com/images/I/310oG5MqhEL._SX300_SY300_QL70_FMwebp_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/310oG5MqhEL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/51BBPQIhNhL._SL1000_.jpg",
      "https://m.media-amazon.com/images/I/41QMjIEUVzL._SL1000_.jpg",
      "https://m.media-amazon.com/images/I/51fEU0z8veL._SL1000_.jpg"
    ],
    category: "Tablets",
    brand: "Oppo",
    color: "Silver",
    rating: 4.0,
    inStock: false,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Oppo Pad Air, 10.36-inch 2K, 4GB RAM, 128GB, Silver."
  },
  // Laptops
  {
    id: 110,
    name: "HP Pavilion 15",
    price: 74999,
    image: "https://m.media-amazon.com/images/I/71bw2H9xQ1L._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71bw2H9xQ1L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71-yuf1JRHL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/715Skaxx0CL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61GEL26QnAL._SL1500_.jpg"
    ],
    category: "Laptops",
    brand: "HP",
    color: "Silver",
    rating: 4.6,
    inStock: false,
    isOffer: true,
    isBestSeller: false,
    badge: "Offer",
    description: "HP Pavilion, Intel Core i5 12th Gen, 16GB RAM, 512GB SSD."
  },
  {
    id: 111,
    name: "Dell Inspiron 15",
    price: 69999,
    image: "https://m.media-amazon.com/images/I/41mr-soLnxL._SX300_SY300_QL70_FMwebp_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/41mr-soLnxL._SX300_SY300_QL70_FMwebp_.jpg",
      "https://m.media-amazon.com/images/I/61Gmlf8jJdL._SL1080_.jpg",
      "https://m.media-amazon.com/images/I/61uXQhbNmML._SL1080_.jpg",
      "https://m.media-amazon.com/images/I/61ENUXXQLqL._SL1080_.jpg"
    ],
    category: "Laptops",
    brand: "Dell",
    color: "Gray",
    rating: 4.3,
    inStock: true,
    isOffer: false,
    isBestSeller: true,
    badge: "Best Seller",
    description: "Dell Inspiron 15, 12th Gen i5, 16GB RAM, 512GB SSD, Gray."
  },
  {
    id: 112,
    name: "Asus VivoBook 14",
    price: 59999,
    image: "https://m.media-amazon.com/images/I/71Mh-ltniDL._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71Mh-ltniDL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71S8U9VzLTL._AC_UY218_.jpg",
      "https://m.media-amazon.com/images/I/81-hLxe38BL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81+bpNQrw9L._SL1500_.jpg"
    ],
    category: "Laptops",
    brand: "Asus",
    color: "White",
    rating: 4.2,
    inStock: true,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Asus VivoBook 14, 11th Gen i3, 8GB RAM, 512GB SSD, White."
  },
  // Accessories (Boat)
  {
    id: 113,
    name: "Boat Rockerz 450 Pro",
    price: 1999,
    image: "https://m.media-amazon.com/images/I/711l4y8aNlL._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/711l4y8aNlL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71Ls5i3fB3L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71TIEZXXxkL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71iwxemAZBL._SL1500_.jpg"
    ],
    category: "Accessories",
    brand: "Boat",
    color: "Blue",
    rating: 4.2,
    inStock: true,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Boat Rockerz 450 Pro with 70H Battery, Dual Pairing, Blue."
  },
  {
    id: 116,
    name: "JBL Tune 510BT",
    price: 2999,
    image: "https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61567V7b75S._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61Z5ypZ-kiL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/51Bb0eFN7jS._SL1500_.jpg"
    ],
    category: "Accessories",
    brand: "JBL",
    color: "Black",
    rating: 4.5,
    inStock: true,
    isOffer: true,
    isBestSeller: true,
    badge: "Best Seller",
    description: "JBL Tune 510BT Wireless On-Ear Headphones, Pure Bass Sound, Black."
  },
  // Vivo Smartphone
  {
    id: 114,
    name: "Vivo Y29 Pro",
    price: 28999,
    image: "https://m.media-amazon.com/images/I/71MqvSTLQgL._SL1500_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/71MqvSTLQgL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81iVhpEsmqL._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/61Tgxiz3p0L._SL1500_.jpg",
      "https://m.media-amazon.com/images/I/71WdDQAZjxL._SL1500_.jpg"
    ],
    category: "Smartphones",
    brand: "Vivo",
    color: "Black",
    rating: 4.4,
    inStock: true,
    isOffer: false,
    isBestSeller: false,
    badge: "",
    description: "Vivo V29 Pro, 12GB RAM, 256GB, 50MP Camera, Red."
  },
  // Oppo Smartphone
  {
    id: 115,
    name: "Oppo Reno 11",
    price: 31999,
    image: "https://m.media-amazon.com/images/I/61Gq6YKRQlL._SL1000_.jpg",
    images: [
      "https://m.media-amazon.com/images/I/61Gq6YKRQlL._SL1000_.jpg",
      "https://m.media-amazon.com/images/I/51P4Wfy9nCL._SL1000_.jpg",
      "https://m.media-amazon.com/images/I/61oXxOllCYL._SL1000_.jpg",
      "https://m.media-amazon.com/images/I/41TVCswSKsL._SL1000_.jpg"
    ],
    category: "Smartphones",
    brand: "Oppo",
    color: "Green",
    rating: 4.1,
    inStock: false,
    isOffer: true,
    isBestSeller: false,
    badge: "Offer",
    description: "Oppo Reno 11, 8GB RAM, 256GB, 64MP Camera, Green."
  },
];

export default productsData;
