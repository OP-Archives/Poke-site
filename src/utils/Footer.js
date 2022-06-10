import { styled, Typography } from "@mui/material";
import CustomLink from "./CustomLink";

const Footer = styled((props) => (
  <div {...props}>
    <div style={{ marginTop: "0.5rem" }}>
      <Typography variant="caption" color="textSecondary">
        {`Pokelawls © ${new Date().getFullYear()}`}
      </Typography>
    </div>
    <CustomLink href="https://twitter.com/overpowered" rel="noopener noreferrer" target="_blank">
      <Typography variant="caption" color="textSecondary">
        made by OP with 💜
      </Typography>
    </CustomLink>
  </div>
))`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`;

export default Footer;
