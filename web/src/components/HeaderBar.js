import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/User';
import { useSetTheme, useTheme } from '../context/Theme';

import {
  API,
  getLogo,
  getSystemName,
  isAdmin,
  isMobile,
  showError,
  showSuccess
} from '../helpers';
import '../index.css';

import fireworks from 'react-fireworks';

import {
  IconCalendarClock, IconChecklistStroked,
  IconComment, IconCreditCard, IconGift,
  IconHelpCircle, IconHistogram,
  IconHome, IconImage,
  IconKey,
  IconLayers, IconPriceTag,
  IconSetting,
  IconUser
} from '@douyinfe/semi-icons';
import { Avatar, Dropdown, Layout, Nav, Switch } from '@douyinfe/semi-ui';
import { stringToColor } from '../helpers/render';

// HeaderBar Buttons
const getHeaderButtons = (isLoggedIn) => {
  let buttons = [
    {
      text: '首页',
      itemKey: 'home',
      to: '/',
      icon: <IconHome />,
    },
    {
      text: '模型价格',
      itemKey: 'pricing',
      to: '/pricing',
      icon: <IconPriceTag />,
    },
  ];

  if (localStorage.getItem('chat_link')) {
    buttons.push({
      text: '聊天',
      itemKey: 'chat',
      to: '/chat',
      icon: <IconComment />,
    });
  }

  if (isLoggedIn) {
    // 如果是管理员，添加这些按钮
    if (isAdmin()) {
      buttons = buttons.concat([
        {
          text: '渠道',
          itemKey: 'channel',
          to: '/channel',
          icon: <IconLayers />,
        },
        {
          text: '兑换码',
          itemKey: 'redemption',
          to: '/redemption',
          icon: <IconGift />,
        },
        {
          text: '用户管理',
          itemKey: 'user',
          to: '/user',
          icon: <IconUser />,
        },
      ]);
    }

    buttons = buttons.concat([
      {
        text: '令牌',
        itemKey: 'token',
        to: '/token',
        icon: <IconKey />,
      },
      {
        text: '钱包',
        itemKey: 'topup',
        to: '/topup',
        icon: <IconCreditCard />,
      },
      {
        text: '日志',
        itemKey: 'log',
        to: '/log',
        icon: <IconHistogram />,
      },
      {
        text: '数据看板',
        itemKey: 'detail',
        to: '/detail',
        icon: <IconCalendarClock />,
        hidden: localStorage.getItem('enable_data_export') !== 'true',
      },
      {
        text: '绘图',
        itemKey: 'midjourney',
        to: '/midjourney',
        icon: <IconImage />,
        hidden: localStorage.getItem('enable_drawing') !== 'true',
      },
      {
        text: '异步任务',
        itemKey: 'task',
        to: '/task',
        icon: <IconChecklistStroked />,
        hidden: localStorage.getItem('enable_task') !== 'true',
      },
      {
        text: '设置',
        itemKey: 'setting',
        to: '/setting',
        icon: <IconSetting />,
      },
    ]);
  }

  // 过滤掉 hidden 为 true 的按钮
  return buttons.filter((button) => !button.hidden);
};

const HeaderBar = () => {
  const [userState, userDispatch] = useContext(UserContext);
  let navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const systemName = getSystemName();
  const logo = getLogo();
  const currentDate = new Date();
  const isNewYear =
    (currentDate.getMonth() === 0 && currentDate.getDate() === 1) ||
    (currentDate.getMonth() === 1 &&
      currentDate.getDate() >= 9 &&
      currentDate.getDate() <= 24);

  const handleLogout = async () => {
    setShowSidebar(false);
    try {
      await API.get('/api/user/logout');
      showSuccess('注销成功!');
      userDispatch({ type: 'logout' });
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      showError('注销失败，请重试。');
    }
  };

  const handleNewYearClick = () => {
    fireworks.init('root', {});
    fireworks.start();
    setTimeout(() => {
      fireworks.stop();
      setTimeout(() => {
        window.location.reload();
      }, 10000);
    }, 3000);
  };

  const theme = useTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.setAttribute('theme-mode', 'dark');
    }

    if (isNewYear) {
      console.log('Happy New Year!');
    }
  }, [theme, isNewYear]);

  const isLoggedIn = !!userState.user;

  const handleNavClick = (key) => {
    const matchedItem = getHeaderButtons(isLoggedIn).find(item => item.itemKey === key);
    if (matchedItem && matchedItem.to) {
      navigate(matchedItem.to);
    }
  };

  return (
    <>
      <Layout>
        <div style={{ width: '100%' }}>
          <Nav
            mode={'horizontal'}
            renderWrapper={({ itemElement, isSubNav, isInSubNav, props }) => (
              <Link to={props.to || '/'} style={{ textDecoration: 'none' }}>
                {itemElement}
              </Link>
            )}
            selectedKeys={[]}
            items={getHeaderButtons(isLoggedIn)}
            onSelect={({ itemKey }) => handleNavClick(itemKey)}
            header={{
              logo: (
                <img src={logo} alt='logo' style={{ marginRight: '0.75em' }} />
              ),
              text: systemName,
            }}
            footer={
              <>
                {userState.user ? (
                  <Dropdown
                    position='bottomRight'
                    render={
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={handleLogout}>退出</Dropdown.Item>
                      </Dropdown.Menu>
                    }
                  >
                    <Avatar
                      size='small'
                      color={stringToColor(userState.user.username)}
                      style={{ margin: 4 }}
                    >
                      {userState.user.username[0]}
                    </Avatar>
                    <span>{userState.user.username}</span>
                  </Dropdown>
                ) : (
                  <>
                    <Nav.Item
                      itemKey={'login'}
                      text={'登录'}
                      icon={<IconKey />}
                      to='/login'
                      onClick={() => navigate('/login')}
                    />
                    <Nav.Item
                      itemKey={'register'}
                      text={'注册'}
                      icon={<IconUser />}
                      to='/register'
                      onClick={() => navigate('/register')}
                    />
                  </>
                )}
              </>
            }
          ></Nav>
        </div>
      </Layout>
    </>
  );
};

export default HeaderBar;
