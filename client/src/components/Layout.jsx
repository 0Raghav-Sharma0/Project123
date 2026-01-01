import React, { useState } from 'react'
import { useEffect } from 'react'
import { getCompany } from '../redux/slices/companySlice'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  useMediaQuery,
  Divider,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/slices/authSlice'
const drawerWidth = 260

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Generate Invoice', icon: <AddIcon />, path: '/generate-invoice' },
  { text: 'All Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'Company Profile', icon: <BusinessIcon />, path: '/company-profile' },
  { text: 'Bank Details', icon: <BankIcon />, path: '/bank-details' },
]

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { company, loading: companyLoading } = useSelector((state) => state.company)

  const ASSET_BASE_URL = import.meta.env.VITE_ASSET_URL

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }
  
  useEffect(() => {
    if (isAuthenticated && !company && !companyLoading) {
      dispatch(getCompany())
    }
  }, [isAuthenticated, company, companyLoading, dispatch])
  
  const drawer = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#0f1117',
      borderRight: '1px solid #22252e',
    }}>
      {/* Logo/Company Header */}
      <Box sx={{ 
        p: 3, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: '1px solid #22252e'
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar
            src={
              company?.logo
                ? `${ASSET_BASE_URL}${company.logo}`
                : undefined
            }
            sx={{
              width: 40,
              height: 40,
              bgcolor: '#1a1d26',
              color: '#8b8d96',
              fontSize: 16,
              fontWeight: 500,
              borderRadius: '10px',
              border: '1px solid #22252e',
            }}
          >
            {!company?.logo &&
              (company?.name?.charAt(0).toUpperCase() || 'G')}
          </Avatar>
        </motion.div>
      </Box>
      
      {/* User Info */}
      <Box sx={{ px: 3, py: 2, textAlign: 'center' }}>
        <Typography variant="body2" fontWeight="500" sx={{ color: '#e4e5e7', mb: 0.5 }}>
          {company?.name || 'Company Name'}
        </Typography>
        <Typography variant="caption" sx={{ 
          color: '#8b8d96', 
          fontSize: '0.75rem',
          letterSpacing: '0.02em'
        }}>
        </Typography>
      </Box>

      <Divider sx={{ borderColor: '#22252e', my: 1 }} />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding 
            sx={{ 
              mb: 0.5,
              position: 'relative'
            }}
          >
            <ListItemButton
              selected={location.pathname.startsWith(item.path)}
              onClick={() => {
                navigate(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                borderRadius: '8px',
                py: 1.25,
                px: 2,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(56, 138, 255, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(56, 138, 255, 0.12)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '20px',
                    backgroundColor: '#388aff',
                    borderRadius: '0 2px 2px 0',
                  }
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: location.pathname.startsWith(item.path) ? '#388aff' : '#8b8d96',
                  mr: 1.5,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname.startsWith(item.path) ? 500 : 400,
                  fontSize: '0.875rem',
                  color: location.pathname.startsWith(item.path) ? '#e4e5e7' : '#b0b2ba',
                  letterSpacing: '0.01em',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Bottom Section - Only Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid #22252e' }}>
        {/* Logout Button */}
        <ListItemButton
          sx={{
            borderRadius: '8px',
            py: 1.25,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }
          }}
          onClick={handleLogout}
        >
          <ListItemIcon sx={{ minWidth: 36, color: '#8b8d96', mr: 1.5 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{
              fontWeight: 400,
              fontSize: '0.875rem',
              color: '#b0b2ba',
              letterSpacing: '0.01em',
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )
  
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#14161f'
    }}>
      <CssBaseline />
      
      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#1a1d26',
          color: '#e4e5e7',
          borderBottom: '1px solid #22252e',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar sx={{ 
          px: { xs: 2, md: 3 }, 
          minHeight: 64,
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: '#8b8d96',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap sx={{ 
            flexGrow: 1, 
            fontWeight: 500,
            fontSize: '1.125rem',
            color: '#e4e5e7',
            letterSpacing: '-0.01em',
          }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
          </Typography>
          
          {/* Company Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={
                company?.logo
                  ? `${ASSET_BASE_URL}${company.logo}`
                  : undefined
              }
              sx={{
                width: 32,
                height: 32,
                bgcolor: '#22252e',
                color: '#8b8d96',
                fontWeight: 500,
                fontSize: '0.75rem',
                borderRadius: '8px',
                border: '1px solid #2d3039',
              }}
            >
              {!company?.logo &&
                (company?.name?.charAt(0).toUpperCase() || 'C')}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0f1117',
              borderRight: '1px solid #22252e',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              bgcolor: '#0f1117',
              borderRight: '1px solid #22252e',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#14161f',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }} />
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Box sx={{ 
            maxWidth: '1600px', 
            mx: 'auto',
          }}>
            <Outlet />
          </Box>
        </motion.div>
      </Box>
    </Box>
  )
}