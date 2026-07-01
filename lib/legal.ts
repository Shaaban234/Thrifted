// Legal document content, rendered by app/legal/[doc].tsx.
//
// These are plain-language templates drafted around Pakistani law (Contract Act
// 1872, Sale of Goods Act 1930, Electronic Transactions Ordinance 2002,
// Prevention of Electronic Crimes Act 2016 (PECA), and the provincial /
// Islamabad Consumer Protection Acts). They are NOT a substitute for advice from
// a licensed Pakistani lawyer — have them reviewed before relying on them.

export type LegalDoc = "terms" | "privacy" | "buyer-protection";

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalContent {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const COMPANY = "NayaPurana";
const UPDATED = "1 July 2026";

export const LEGAL: Record<LegalDoc, LegalContent> = {
  terms: {
    title: "Terms & Conditions",
    updated: UPDATED,
    intro:
      `Welcome to ${COMPANY}. These Terms govern your use of the ${COMPANY} app and services in Pakistan. ` +
      `By creating an account or using the app, you accept these Terms. If you do not agree, please do not use ${COMPANY}.`,
    sections: [
      {
        heading: "1. Who we are",
        body: [
          `${COMPANY} is an online marketplace that lets users in Pakistan list, buy and sell pre-owned and new items.`,
          `${COMPANY} is an intermediary platform. Contracts of sale are formed directly between the buyer and the seller under the Contract Act 1872 and the Sale of Goods Act 1930. ${COMPANY} is not a party to those contracts unless expressly stated.`,
        ],
      },
      {
        heading: "2. Eligibility",
        body: [
          "You must be at least 18 years old, or have the consent of a parent or lawful guardian, and be legally capable of entering into a binding contract under Pakistani law.",
          "You are responsible for keeping your account credentials secure and for all activity under your account.",
        ],
      },
      {
        heading: "3. Listing and selling",
        body: [
          "Sellers must accurately describe items, own the right to sell them, and set a lawful price. Listings must not be false, misleading or infringe any third-party rights.",
          "Prohibited items include (without limitation) counterfeit goods, weapons, drugs, alcohol, tobacco, hazardous materials, stolen property, and anything unlawful to sell in Pakistan. We may remove any listing that violates these Terms or applicable law.",
        ],
      },
      {
        heading: "4. Buying and payments",
        body: [
          "Buyers agree to pay the listed price plus any applicable Buyer Protection and shipping fees shown at checkout. Prices are in Pakistani Rupees (PKR).",
          "Payments are processed through the methods offered in the app (for example card payment or Cash on Delivery). To protect you, keep all payments and communication within the app. Sharing phone numbers, links or external payment details (such as bank, JazzCash or EasyPaisa transfers) is not permitted in chat.",
        ],
      },
      {
        heading: "5. Fees",
        body: [
          `${COMPANY} may charge Buyer Protection, service or shipping fees, which are disclosed before you confirm an order. We may change our fees from time to time; changes apply to future transactions only.`,
        ],
      },
      {
        heading: "6. Prohibited conduct",
        body: [
          "You agree not to use the platform for fraud, harassment, abusive language, spam, circumventing fees, or any activity that violates the Prevention of Electronic Crimes Act 2016 (PECA) or other Pakistani law.",
          "We use automated and manual checks to keep the community safe and may suspend or remove accounts and content that breach these Terms.",
        ],
      },
      {
        heading: "7. Consumer rights",
        body: [
          "Nothing in these Terms limits any rights you have under the applicable Consumer Protection laws of Pakistan (including the Islamabad Consumer Protection Act 1995 and the relevant provincial Consumer Protection Acts).",
          "Buyer Protection is described in the separate Buyer Protection policy in the app.",
        ],
      },
      {
        heading: "8. Liability",
        body: [
          `To the maximum extent permitted by law, ${COMPANY} is not liable for the acts or omissions of buyers or sellers, or for the quality, safety or legality of items listed. Our aggregate liability to you is limited to the fees you paid to ${COMPANY} for the transaction in question.`,
        ],
      },
      {
        heading: "9. Governing law and disputes",
        body: [
          "These Terms are governed by the laws of the Islamic Republic of Pakistan. The courts of Pakistan have exclusive jurisdiction over any dispute arising out of or relating to these Terms or your use of the app.",
          `We encourage you to contact ${COMPANY} support first so we can try to resolve any issue.`,
        ],
      },
      {
        heading: "10. Changes and contact",
        body: [
          "We may update these Terms; the “Last updated” date shows the latest version, and continued use means you accept the changes.",
          "Questions about these Terms? Reach us through the in-app support option.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    updated: UPDATED,
    intro:
      `This Policy explains how ${COMPANY} collects, uses and protects your personal data when you use our app in Pakistan, ` +
      `consistent with the Electronic Transactions Ordinance 2002, the Prevention of Electronic Crimes Act 2016 (PECA), and the principles of Pakistan's proposed personal data protection framework.`,
    sections: [
      {
        heading: "1. Data we collect",
        body: [
          "Account data: your name, username, email, password (stored only as a secure hash), and profile details you choose to add.",
          "Transaction data: listings, orders, shipping address, and payment method (we do not store full card numbers).",
          "Usage and content data: messages sent in chat, items you view or favourite, and technical information such as device and app version.",
        ],
      },
      {
        heading: "2. How we use your data",
        body: [
          "To create and operate your account, show and process listings and orders, arrange delivery, and provide support.",
          "To keep the marketplace safe — for example detecting fraud, abuse, and attempts to take payments off-platform — and to comply with Pakistani law.",
          "We process your data on the basis of performing our contract with you, your consent, and our legitimate interest in running a safe service.",
        ],
      },
      {
        heading: "3. Sharing your data",
        body: [
          `We share only what is necessary: your public profile and listing details are visible to other users; a seller and buyer see the information needed to complete a transaction (such as the shipping address).`,
          "We may share data with service providers who host or operate the app on our behalf, and with authorities where required by law or valid legal process under PECA 2016.",
          "We do not sell your personal data.",
        ],
      },
      {
        heading: "4. Data security and retention",
        body: [
          "We use reasonable technical and organisational measures to protect your data, including hashing passwords and restricting access.",
          "We keep personal data only as long as needed for the purposes above or as required by Pakistani law, after which it is deleted or anonymised.",
        ],
      },
      {
        heading: "5. Your rights",
        body: [
          "You can access and update most of your information from your profile and account settings, and you can request deletion of your account.",
          "When you delete your account, your listings, orders and related data are removed, subject to any records we must retain by law.",
        ],
      },
      {
        heading: "6. Children",
        body: [
          `${COMPANY} is not intended for anyone under 18 without the consent of a parent or lawful guardian.`,
        ],
      },
      {
        heading: "7. Governing law and contact",
        body: [
          "This Policy is governed by the laws of the Islamic Republic of Pakistan.",
          "For privacy questions or requests, contact us through the in-app support option.",
        ],
      },
    ],
  },

  "buyer-protection": {
    title: "Buyer Protection",
    updated: UPDATED,
    intro:
      `Buyer Protection keeps your purchases on ${COMPANY} safe. When you pay through the app and add the Buyer Protection fee at checkout, your order is covered as described below.`,
    sections: [
      {
        heading: "What's covered",
        body: [
          "Your item doesn't arrive.",
          "Your item arrives significantly not as described in the listing.",
          "Your item is damaged in transit.",
        ],
      },
      {
        heading: "How you're protected",
        body: [
          "Keep payments and messages inside the app. For card payments, your money is held and only released to the seller after your order is confirmed as delivered as described.",
          "For Cash on Delivery, you pay only when the parcel arrives, so you can check the item first.",
        ],
      },
      {
        heading: "If something goes wrong",
        body: [
          "Open the order in the app and contact the seller first. If it isn't resolved, raise the issue with our support team.",
          "Report a problem promptly after delivery so we can review the order, messages and evidence and help arrange a refund where eligible.",
        ],
      },
      {
        heading: "What's not covered",
        body: [
          "Deals arranged or paid for outside the app (for example direct bank, JazzCash or EasyPaisa transfers), which is why off-platform payment details are blocked in chat.",
          "Minor differences that were disclosed in the listing, buyer's remorse, or prohibited items.",
        ],
      },
      {
        heading: "Your legal rights",
        body: [
          "Buyer Protection is in addition to — and does not limit — your rights under the applicable Consumer Protection laws of Pakistan.",
        ],
      },
    ],
  },
};
