/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */
import ProLayout, { DefaultFooter, SettingDrawer, getMenuData } from '@ant-design/pro-layout';
import React, { useEffect, useState } from 'react';
import { Link, connect, history } from 'umi';
import { Result, Button, Tabs, BackTop } from 'antd';
import path from 'path'
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { getAuthorityFromRouter } from '@/utils/utils';
import logo from '../assets/logo.svg';
import DraggableTabs from "./TabMenuLayout";

const { TabPane } = Tabs;

const noMatch = (
  <Result
    status={403}
    title="403"
    subTitle="Sorry, you are not authorized to access this page."
    extra={
      <Button type="primary">
        <Link to="/user/login">Go Login</Link>
      </Button>
    }
  />
);
/**
 * use Authorized check all menu item
 */

const menuDataRender = (menuList) =>
  menuList.map((item) => {
    const localItem = {
      ...item,
      children: item.children ? menuDataRender(item.children) : undefined,
    };
    return Authorized.check(item.authority, localItem, null);
  });

const defaultFooterDom = <DefaultFooter copyright={`${new Date().getFullYear()} 山东雅图`} />;

const BasicLayout = (props) => {
  const {
    dispatch,
    children,
    settings,
    visitedViews,
    location = {
      pathname: '/',
    },
  } = props;
  const [activeTagKey, setActiveTagKey] = useState()
  const [nowRouter, setNowRouter] = useState()
  const { breadcrumb } = getMenuData(props.routes, settings.menu, menuDataRender);
  /**
   * tab内容
   */
  const filterAffixTags = (routes, basePath = '/') => {
    let tags = []
    routes.forEach(route => {
      if (route.meta && route.meta.affix) {
        // if (route.meta && route.meta.affix) {
        const tagPath = path.resolve(basePath, route.path)
        tags.push({
          fullPath: tagPath,
          path: tagPath,
          name: route.name,
          meta: { ...route.meta }
        })
      }
      if (route.children) {
        const tempTags = filterAffixTags(route.children, route.path)
        if (tempTags.length >= 1) {
          tags = [...tags, ...tempTags]
        }
      }
    })
    return tags
  }
  const formatTags = (routes, basePath = '/') => {
    let tags = []
    routes.forEach(route => {
      if (route.meta) {
        const tagPath = path.resolve(basePath, route.path)
        tags.push({
          fullPath: tagPath,
          path: tagPath,
          name: route.name,
          meta: { ...route.meta }
        })
      }
      if (route.children) {
        const tempTags = formatTags(route.children, route.path)
        if (tempTags.length >= 1) {
          tags = [...tags, ...tempTags]
        }
      }
    })
    return tags
  }
  const toTabPage = (key) => {
    props.history.push(key)
  }
  const toLastView = (tagList, key) => {
    const latestView = tagList.slice(-1)[0]
    if (latestView) {
      props.history.push(latestView.fullPath)
    } else if (key !== "/dashboard/analysis") {
      props.history.push("/dashboard/analysis")
    }
  }
  const onTabDelete = (targetKey, action) => {
    if (action === "remove") {
      if (targetKey === "/dashboard/analysis" && visitedViews.length === 1) {
        console.log("不能关闭首页")
      } else {
        dispatch({
          type: "tagView/delVisitedView",
          payload: targetKey
        })
        if (targetKey === activeTagKey) {
          toLastView(visitedViews, targetKey)
        }
      }

    }
  }
  // 初始化TAG
  const initTags = () => {
    const affixTags = filterAffixTags(props.route.routes) || []
    affixTags.forEach((tag) => {
      if (tag.name) {
        setActiveTagKey(tag.path)
        dispatch({
          type: 'tagView/addVisitedView',
          payload: tag
        })
      }
    })
  }
  const addTags = () => {
    if (nowRouter) {
      const { name } = nowRouter
      const tag = formatTags([nowRouter])[0]
      if (name) {
        dispatch({
          type: 'tagView/addVisitedView',
          payload: tag
        })
        dispatch({
          type: 'tagsView/addCachedView',
          payload: tag
        })
      }
    }
  }
  const moveToCurrentTag = () => {
    // 标签移动到当前的页面上
    if (nowRouter) {
      setActiveTagKey(nowRouter.path)
    }
  }
  /**
   * constructor
   */

  useEffect(() => {
    if (dispatch) {
      dispatch({
        type: 'user/fetchCurrent',
      });
      initTags();
      addTags();
    }
  }, []);
  useEffect(() => {
    setNowRouter(breadcrumb[location.pathname])
  }, [location])
  useEffect(() => {
    addTags();
    moveToCurrentTag();
  }, [nowRouter])
  /**
   * init variables
   */

  const handleMenuCollapse = (payload) => {
    if (dispatch) {
      dispatch({
        type: 'global/changeLayoutCollapsed',
        payload,
      });
    }
  }; // get children authority

  const authorized = getAuthorityFromRouter(props.route.routes, location.pathname || '/') || {
    authority: undefined,
  };
  return (
    <>
      <ProLayout
        logo={logo}
        hideChildrenInMenu
        contentStyle={{ margin: 0, height: "calc(100vh - 100px)" }}
        onMenuHeaderClick={() => history.push('/')}
        footerRender={() => defaultFooterDom}
        menuDataRender={menuDataRender}
        subMenuItemRender={false}
        rightContentRender={() => <RightContent />}
        menuItemRender={(menuItemProps, defaultDom) => {
          if (menuItemProps.isUrl || !menuItemProps.path) {
            return defaultDom;
          }

          return <Link to={menuItemProps.path}>{defaultDom}</Link>;
        }}

        itemRender={(route, params, routes, paths) => {
          const first = routes.indexOf(route) === 0;
          return first ? (
            <Link to={paths.join('/')}>{route.breadcrumbName}</Link>
          ) : (
              <span>{route.breadcrumbName}</span>
            );
        }}
        breadcrumbRender={(routers = []) => [
          {
            path: '/',
            breadcrumbName: '首页',
          },
          ...routers,
        ]}
        onCollapse={handleMenuCollapse}
        {...props}
        {...settings}
      >
        <Authorized authority={authorized.authority} noMatch={noMatch}>

          <div style={{ margin: "12px" }}>
            <div className="card-container">
              <Tabs
                hideAdd
                onTabClick={toTabPage}
                activeKey={activeTagKey}
                animated
                type="editable-card"
                onEdit={onTabDelete}>
                {
                  visitedViews.map((tag) => {
                    return <TabPane tab={tag.title} key={tag.path}>
                      {children}
                      {/* <BackTop>
                        <div className="backTop">UP</div>
                      </BackTop> */}
                    </TabPane>
                  })
                }
              </Tabs></div>
          </div>
        </Authorized>
      </ProLayout>
      <SettingDrawer
        settings={settings}
        onSettingChange={(config) =>
          dispatch({
            type: 'settings/changeSetting',
            payload: config,
          })
        }
      />
    </>
  );
};

export default connect(({ global, tagView, settings }) => ({
  collapsed: global.collapsed,
  visitedViews: tagView.visitedViews,
  tagView,
  settings,
}))(BasicLayout);
