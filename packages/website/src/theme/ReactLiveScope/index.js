import React from 'react'
import cx from 'clsx'
import * as art from 'ali-react-table'
import styled from 'styled-components'
import * as fusion from '@alifd/next'
import * as antd from 'antd'
import useThemeContext from '@theme/hooks/useThemeContext'
import * as assets from 'storybook/assets'

const LightBaseTable = art.BaseTable
const DarkBaseTable = styled(art.BaseTable)`
  --bgcolor: #333;
  --header-bgcolor: #45494f;
  --hover-color: #46484a;
  --hover-bgcolor: #46484a;
  --highlight-bgcolor: #191a1b;
  --header-highlight-bgcolor: #191a1b;
  --color: #dadde1;
  --header-color: #dadde1;
  --lock-shadow: rgba(200, 200, 200, 0.1) 0 0 6px 2px;
  --border-color: #3c4045;
`

const ThemedBaseTable = React.forwardRef((props, ref) => {
  const { isDarkTheme } = useThemeContext()

  const Table = isDarkTheme ? DarkBaseTable : LightBaseTable

  return <Table ref={ref} {...props} />
})

const DetailDiv = styled.div`
  display: flex;
  min-width: 800px;

  p:first-child {
    margin-top: 0;
  }
  p {
    margin: 0;
    line-height: 20px;
  }

  .right {
    margin-left: 48px;
  }
`

const ReactLiveScope = {
  React,
  ...React,
  ...art,
  BaseTable: ThemedBaseTable,
  fusion,
  antd,
  styled,
  ...fusion,
  cx,
  assets,

  DetailDiv,
}

export default ReactLiveScope