export const shippingPolicy = {
  id: "shipping",
  title: "Shipping Policy",
  lastUpdated: "August 31, 2026",
  description: "Order processing, dispatch timelines, and delivery information.",
  intro: "At thelovesides, we are committed to delivering your orders safely, securely, and in a timely manner. Please review our shipping policy below for detailed information about our processing and delivery timelines.",
  sections: [
    {
      id: "order-processing-dispatch",
      heading: "1. Order Processing & Dispatch",
      blocks: [
        { type: "paragraph", text: "Orders are typically processed and dispatched within 1 to 3 business days after payment confirmation." },
        { type: "paragraph", text: "Custom-sized or made-to-order curtains and blinds may require an additional 2 to 4 business days for tailoring and quality inspection before dispatch." },
        { type: "paragraph", text: "Orders placed on Sundays or public holidays will be processed on the next business working day." }
      ]
    },
    {
      id: "delivery-time",
      heading: "2. Delivery Time",
      blocks: [
        { type: "paragraph", text: "Standard delivery across most serviceable pin codes in India typically takes 4 to 7 business days from the date of dispatch." },
        { type: "paragraph", text: "Remote, north-eastern, or rural locations may take 7 to 10 business days for delivery depending on courier partner coverage." },
        { type: "paragraph", text: "You will receive regular SMS/WhatsApp and email updates as your shipment progresses." }
      ]
    },
    {
      id: "courier-delays-rto",
      heading: "3. Courier Delays & RTO",
      blocks: [
        { type: "paragraph", text: "While we strive to meet all estimated delivery timelines, occasional delays may occur due to adverse weather conditions, courier operational bottlenecks, festive season volume, or regional restrictions beyond our direct control." },
        { type: "paragraph", text: "In case a package is marked as RTO (Return to Origin) due to an incorrect/incomplete address or consignee unavailability, re-shipping charges will apply." }
      ]
    },
    {
      id: "change-of-delivery-address",
      heading: "4. Change of Delivery Address",
      blocks: [
        { type: "paragraph", text: "Address changes can only be accommodated before your order has been dispatched." },
        { type: "paragraph", text: "If you need to modify your shipping address, please contact our support team within 12 to 24 hours of placing your order at lykwestore12@gmail.com or via WhatsApp at 6396762002." },
        { type: "callout", text: "Important: Once the package has been handed over to our courier partner, the delivery address cannot be altered." }
      ]
    },
    {
      id: "tracking-information",
      heading: "5. Tracking Information",
      blocks: [
        { type: "paragraph", text: "Once your order is dispatched, you will receive a tracking link and shipment AWB number via email and SMS/WhatsApp." },
        { type: "paragraph", text: "You can use the provided tracking link to check real-time status and estimated delivery dates directly on the courier partner's tracking portal." }
      ]
    },
    {
      id: "delivery-attempts",
      heading: "6. Delivery Attempts",
      blocks: [
        { type: "paragraph", text: "Our courier partners will attempt delivery up to 2–3 times before returning the shipment to our warehouse." },
        { type: "paragraph", text: "Please ensure someone is available at the provided delivery address to receive the parcel and verify package condition upon arrival." }
      ]
    },
    {
      id: "damaged-package",
      heading: "7. Damaged Package",
      blocks: [
        { type: "paragraph", text: "Please inspect the parcel exterior before accepting delivery from the courier agent." },
        { type: "paragraph", text: "If the package appears visibly opened, tampered with, or severely damaged, please take clear photos/videos immediately and refuse delivery or accept with remarks." },
        { type: "paragraph", text: "Contact our support team within 24 hours of delivery with photographic evidence so we can assist you promptly." }
      ]
    },
    {
      id: "shipping-support",
      heading: "8. Shipping Support",
      blocks: [
        { type: "paragraph", text: "For any questions regarding order shipments, tracking assistance, or delivery queries, please reach out to our dedicated support team:" },
        { type: "contactCard", items: [
          { icon: "User", label: "Contact Person", value: "Arti Thakur" },
          { icon: "MapPin", label: "Address", value: "12/50A Dalhai Tajganj Agra 282001 (Near Madan Mohan Mandir)" },
          { icon: "Phone", label: "Active Contact No", value: "6396762002" },
          { icon: "Mail", label: "Email", value: "lykwestore12@gmail.com" }
        ]},
        { type: "paragraph", text: "The Love Sides — Made with love for your beautiful spaces." }
      ]
    }
  ]
};
