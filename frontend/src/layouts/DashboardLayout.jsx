import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  BulbOutlined,
  UsergroupAddOutlined,
  MailOutlined,
  LaptopOutlined,
  SendOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, theme } from "antd";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "../assets/Logo/CEIT_hor.png";
import { UserOutlined  } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();

  const handleProfileAllClick = () => {
    navigate("/user-management");
  };

  const handleLogoutClick = () => {
    navigate("/login");
  };
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop;
      setHasShadow(scrollTop > 0);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const { pathname } = useLocation();

  const [hasShadow, setHasShadow] = useState(false);

  return (
    <Layout className="main-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
      >
        <div className="nav-logo">
          <img src={Logo} alt="logo" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          items={[
            {
              key: "/dashboard",
              icon: <DashboardOutlined />,
              label: <NavLink to="/dashboard">Dashboard</NavLink>,
            },
            {
              key: "/campaigns",
              icon: <BulbOutlined />,
              label: <NavLink to="/campaigns">Campaigns</NavLink>,
            },
            {
              key: "/user-and-group",
              icon: <UsergroupAddOutlined />,
              label: <NavLink to="/user-and-group">User & Group</NavLink>,
            },
            {
              key: "/email-templates",
              icon: <MailOutlined />,
              label: <NavLink to="/email-templates">Email Templates</NavLink>,
            },
            {
              key: "/landing-pages",
              icon: <LaptopOutlined />,
              label: <NavLink to="/landing-pages">Landing Pages</NavLink>,
            },
            {
              key: "/sending-profiles",
              icon: <SendOutlined />,
              label: <NavLink to="/sending-profiles">Sending Profiles</NavLink>,
            },
            {
              key: "/user-management",
              icon: <SettingOutlined />,
              label: <NavLink to="/user-management">User Management</NavLink>,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1000,
            padding: 0,
            background: colorBgContainer,
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: hasShadow ? "0 2px 4px rgba(0, 0, 0, 0.4)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
              borderRadius: "50%",
            }}
          />
          <div style={{ position: "fixed", right: 85 }}>
            <Button
              icon={<UserOutlined />}
              style={{
                fontSize: "16px",

                height: 40,
                marginRight: -1,
              }}
              onClick={handleProfileAllClick}
            >
              admin@gmail.com
            </Button>
            </div>
            <div style={{ position: "fixed" ,top:4.5, right: 15 }}>
            <Button
              type="primary"
              icon={<LogoutOutlinedIcon />}
              style={{
                fontSize: "16px",
                width: 70,
                height: 40,
                backgroundColor: "rgb(0,22,40)",
                color: "#FFF",
              }}
              onClick={handleLogoutClick}
            />
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "90px 16px",
              borderRadius: borderRadiusLG,
            }}
          >
            <main>{children}</main>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
