import * as React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Divider from "@mui/material/Divider";
import CourseGridModal from "./CourseGridModal";

const StyledToolbar = styled(Toolbar)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: 12,
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(99,179,237,0.15)",
  backgroundColor: "rgba(5,8,16,0.75)",
  boxShadow: "0 4px 24px rgba(5,8,16,0.6)",
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const [courseOpen, setCourseOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "rgb(5, 8, 16)",
        backgroundImage: "none",
        pt: "calc(var(--template-frame-height, 0px) + 28px)",
        zIndex: (t) => t.zIndex.appBar + 100,
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Typography
              fontWeight={800}
              sx={{
                fontFamily: "var(--font-syne, sans-serif)",
                fontSize: "0.9rem",
                letterSpacing: "1px",
                color: "#63b3ed",
                mr: 1,
              }}
            >
              CODE<span style={{ color: "#e2e8f0" }}>STATION</span>
            </Typography>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                LinkComponent={Link}
                variant="text"
                color="info"
                size="small"
                href="/quem-somos"
              >
                Quem somos
              </Button>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: "rgba(99,179,237,0.25)" }} />
              <Button
                variant="text"
                color="info"
                size="small"
                onClick={() => setCourseOpen(true)}
              >
                Grade do curso
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <Button
              color="primary"
              variant="text"
              size="small"
              LinkComponent={Link}
              href="/login"
            >
              Login
            </Button>
            <Button
              color="primary"
              variant="contained"
              size="small"
              LinkComponent={Link}
              href="/matricula"
            >
              Matricule-se
            </Button>
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <MenuItem>
                  <Button
                    color="info"
                    variant="text"
                    fullWidth
                    onClick={() => { setOpen(false); setCourseOpen(true); }}
                  >
                    Grade do curso
                  </Button>
                </MenuItem>
                <MenuItem sx={{ mt: 1 }}>
                  <Button
                    color="primary"
                    variant="contained"
                    fullWidth
                    LinkComponent={Link}
                    href="/login"
                  >
                    Login
                  </Button>
                </MenuItem>
                <MenuItem>
                  <Button
                    color="primary"
                    variant="outlined"
                    fullWidth
                    LinkComponent={Link}
                    href="/matricula"
                  >
                    Matricule-se
                  </Button>
                </MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
      <CourseGridModal open={courseOpen} onClose={() => setCourseOpen(false)} />
    </AppBar>
  );
}
