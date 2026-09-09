/*
 * POSTS is the database for the whole site.
 * Each object below is one weekly "Top 10" post. Its `category` field must
 * match one of the ids in categories.js — that's what puts it on the right
 * page and gives it the right set of filter labels.
 *
 * TO ADD A NEW WEEK BY HAND:
 *   1. Copy one of the objects below (the { ... } block) including the comma after it.
 *   2. Paste it at the TOP of the POSTS array (so it shows up as the newest).
 *   3. Edit the fields with your new week's content.
 *   4. Save the file and push — the site updates automatically.
 *
 * EASIER WAY: open admin.html, fill in the form, click "Generate code",
 * then paste the object it gives you right here instead of typing it by hand.
 */
const POSTS = [
  {
    id: "week-36-2026",
    category: "gadgets",
    weekLabel: "Week 36",
    title: "10 Kitchen & Home Gadgets That Are Actually Worth It",
    date: "2026-09-06",
    cover: "https://picsum.photos/seed/gadgetweek36/1200/600",
    excerpt: "From a milk frother that replaces the coffee shop to a robot vacuum that fits under the couch — this week is all about the home.",
    items: [
      {
        rank: 1,
        name: "Electric Milk Frother",
        image: "https://picsum.photos/seed/gw36-1/500/500",
        blurb: "Rechargeable, whisper-quiet, and it turns any coffee into a latte in about fifteen seconds.",
        price: "$18",
        tag: "Editor's Pick",
        link: "#"
      },
      {
        rank: 2,
        name: "Smart Plug 4-Pack",
        image: "https://picsum.photos/seed/gw36-2/500/500",
        blurb: "Turns every lamp and appliance in the house into something you can schedule or voice-control.",
        price: "$29",
        tag: "Trending",
        link: "#"
      },
      {
        rank: 3,
        name: "Portable Blender Bottle",
        image: "https://picsum.photos/seed/gw36-3/500/500",
        blurb: "USB-rechargeable blender that fits in a bag and makes a smoothie in the time it takes to find your keys.",
        price: "$34",
        tag: "",
        link: "#"
      },
      {
        rank: 4,
        name: "Digital Kitchen Scale",
        image: "https://picsum.photos/seed/gw36-4/500/500",
        blurb: "Slim enough to store in a drawer, precise enough to make baking actually repeatable.",
        price: "$16",
        tag: "Budget Pick",
        link: "#"
      },
      {
        rank: 5,
        name: "Compact Air Fryer",
        image: "https://picsum.photos/seed/gw36-5/500/500",
        blurb: "Small footprint, big crisp. The gadget that quietly took over more kitchens than any other this year.",
        price: "$69",
        tag: "",
        link: "#"
      },
      {
        rank: 6,
        name: "Silicone Stretch Lids Set",
        image: "https://picsum.photos/seed/gw36-6/500/500",
        blurb: "Stretches over bowls, cans and cut fruit. Cuts down on plastic wrap without cutting corners.",
        price: "$15",
        tag: "",
        link: "#"
      },
      {
        rank: 7,
        name: "Smart LED Strip Lights",
        image: "https://picsum.photos/seed/gw36-7/500/500",
        blurb: "Millions of colors, synced to music or movies, controlled entirely from your phone.",
        price: "$25",
        tag: "",
        link: "#"
      },
      {
        rank: 8,
        name: "Mini Robot Vacuum",
        image: "https://picsum.photos/seed/gw36-8/500/500",
        blurb: "Thin enough to slide under most couches, smart enough to map the whole apartment on its own.",
        price: "$149",
        tag: "Splurge",
        link: "#"
      },
      {
        rank: 9,
        name: "Reusable Coffee Capsules",
        image: "https://picsum.photos/seed/gw36-9/500/500",
        blurb: "Fill with your own grounds and keep using your pod machine without the pod waste.",
        price: "$13",
        tag: "",
        link: "#"
      },
      {
        rank: 10,
        name: "Herb Garden Kit with Grow Light",
        image: "https://picsum.photos/seed/gw36-10/500/500",
        blurb: "Self-watering pods and a built-in grow light mean fresh basil even without a windowsill.",
        price: "$54",
        tag: "",
        link: "#"
      }
    ]
  }
];
