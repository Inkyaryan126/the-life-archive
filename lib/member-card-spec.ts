/**
 * Canonical Member Card Specification & Geometry Constants
 * Physical CR80 Standard: 85.6mm x 53.98mm (Aspect Ratio: 1.58577)
 */

export const MEMBER_CARD_SPEC = {
  // Physical dimensions (mm)
  widthMm: 85.6,
  heightMm: 53.98,
  aspectRatio: 1.58577,

  // Render template dimensions (px)
  frontWidth: 1582,
  frontHeight: 994,
  backWidth: 1578,
  backHeight: 997,

  // Front overlay bounding boxes (percentages)
  frontNameBox: {
    left: "40.3%",
    top: "39.8%",
    width: "53.9%",
    height: "18.0%"
  },
  memberSinceBox: {
    left: "47.1%",
    top: "78.0%",
    width: "15.6%",
    height: "9.7%"
  },

  // Back overlay bounding boxes (percentages)
  qrBox: {
    left: "59.3%",
    top: "29.4%",
    width: "27.8%",
    height: "36.5%"
  },
  activationCodeBox: {
    left: "57.5%",
    top: "77.2%",
    width: "30.8%",
    height: "9.7%"
  }
} as const;
