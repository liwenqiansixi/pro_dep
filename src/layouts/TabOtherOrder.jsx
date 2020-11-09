import React from 'react';
import { connect, history } from 'umi';
import { Divider, Menu, Dropdown, Tooltip } from 'antd';
import { DownOutlined, RedoOutlined } from '@ant-design/icons';


const TabDropdown = (props) => {
  const { dispatch, visitedViews, activeTagKey, tabDelete } = props
  const closeOthersTags = () => {
    dispatch({
      type: "tagView/delOtherVisitedView",
      payload: activeTagKey
    })
  }
  const closeRightTags = () => {
    dispatch({
      type: "tagView/delRightView",
      payload: activeTagKey
    })
  }
  const closeAllTags = () => {
    if (activeTagKey !== "/dashboard/analysis" && visitedViews.length !== 1) {
      dispatch({
        type: "tagView/delAllVisitedView"
      })
      history.push("/dashboard/analysis")
    }
  }
  const refreshTags = () => {
    // history.push(activeTagKey)
  }
  const menu = (
    <Menu>
      <Menu.Item onClick={() => { tabDelete(activeTagKey) }}>
        关闭当前
      </Menu.Item>
      <Menu.Item onClick={closeOthersTags}>
        关闭其他
      </Menu.Item>
      <Menu.Item onClick={closeRightTags}>关闭右侧</Menu.Item>
      <Menu.Item onClick={closeAllTags}>关闭全部</Menu.Item>
    </Menu >
  );
  return (<>
    <Tooltip className="minColor" title="刷新" onClick={refreshTags}><RedoOutlined /></Tooltip>
    <Divider type="vertical" />
    <Dropdown overlay={menu} placement="bottomLeft" arrow>
      <a className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        其他功能 <DownOutlined />
      </a>
    </Dropdown>
  </>)
}
export default connect(({ tagView }) => ({
  visitedViews: tagView.visitedViews,
  tagView,
}))(TabDropdown);
