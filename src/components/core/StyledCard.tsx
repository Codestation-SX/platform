import { styled } from "@mui/material/styles";
import MuiCard from "@mui/material/Box";
export const StyledCard = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  [theme.breakpoints.up("sm")]: {
    maxWidth: "1280px",
  },
  backgroundColor: (theme.vars || theme).palette.background.paper,
  border: "1px solid rgba(99,179,237,0.08)",
  boxShadow: "none",
}));

export default StyledCard;
// This component is a styled Material-UI Card that applies specific styles for layout, padding,
// and box shadow. It is designed to be responsive, adjusting its maximum width on larger screens.
// The styles also adapt based on the theme, providing a different appearance in dark mode.
