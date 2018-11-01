// NPM
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

// COMPONENTS
import DesktopNav from '../Nav/DesktopNav';
import MobileNav from '../Nav/MobileNav';
import Logo from './Logo';
import MobileDropdownMenu from '../Nav/MobileDropdownMenu';
import Search from './Search';

// ACTIONS/CONFIG
import { media } from '../../libs/styled';

// STYLES
const InnerWrap = styled.header`
  align-items: center;
  background: ${props => (props.home && !props.showMenu ? 'transparent' : 'white')};
  position: ${props => props.home && !props.showMenu && 'absolute'};
  display: flex;
  justify-content: ${props => (props.home ? 'space-between' : 'flext-start')};
  height: 65px;
  padding: ${props => (props.home ? '0' : '10px')};
  width: 100%;
  z-index: 110;
  ${props =>
    props.showMenu &&
    css`
      position: fixed;
      top: 0;
    `} ${media.minMedium} {
    height: ${props => (props.home ? 95 : 70)}px;
    padding: ${props => (props.fixed ? '0 25px' : '0')};
  }

  ${props =>
    props.showShadow &&
    css`
      border-bottom: 1px solid #efeff0;

      ${media.minMedium} {
        border-bottom: none;
        box-shadow: 0 8px 25px 0 rgba(141, 141, 141, 0.22);
      }
    `} ${props =>
    props.fixed &&
    css`
      left: 0;
      position: fixed;
      top: 0;
      z-index: 10000;
    `};
`;

// So we don't need to add a margin to each page
const FixedPlaceholder = styled.div`
  margin-top: 85px;
`;

// MODULE
export default class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      showSearch: false,
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleSearch = this.toggleSearch.bind(this);
    this.toggleProfileMenu = this.toggleProfileMenu.bind(this);
  }

  toggleMenu() {
    const { showMenu } = this.state;
    const body = document.body;
    if (showMenu) {
      body.style.overflow = '';
    } else {
      body.style.overflow = 'hidden';
    }
    this.setState({ showMenu: !showMenu });
  }

  componentWillUnmount() {
    const body = document.body;
    body.style.overflow = '';
  }

  toggleProfileMenu() {
    const { showProfileMenu } = this.state;
    const body = document.body;
    if (showProfileMenu) {
      body.style.overflow = '';
    } else {
      body.style.overflow = 'hidden';
    }
    this.setState({ showProfileMenu: !showProfileMenu });
  }

  toggleSearch() {
    const { showSearch } = this.state;
    this.setState({ showSearch: !showSearch });
  }

  render() {
    const { home, fixed, noSearch } = this.props;
    const { showMenu } = this.state;

    return (
      <React.Fragment>
        <InnerWrap
          // eslint-disable-next-line
          role="baner"
          showShadow={fixed && !showMenu}
          showMenu={showMenu}
          home={home}
          fixed={fixed}
        >
          <Logo
            menuIsOpened={showMenu}
            toggleMenu={this.toggleMenu}
            applyFixation={showMenu && !fixed}
            flex={Boolean(home)}
          />
          {!noSearch && (
            <Search
              menuIsOpened={showMenu}
              toggleSearch={this.toggleSearch}
              address={this.props.address}
            />
          )}
          <DesktopNav home={home} theme="light" />
          <MobileDropdownMenu isMenuOpen={showMenu} toggleMenu={this.toggleMenu} dark={!home} />
        </InnerWrap>
        <MobileNav toggleMenu={this.toggleMenu} showProfileMenu={showMenu} />
        {fixed && <FixedPlaceholder />}
      </React.Fragment>
    );
  }
}

// Props Validation
TopBar.propTypes = {
  home: PropTypes.bool,
  fixed: PropTypes.bool,
  withPadding: PropTypes.bool,
};

TopBar.defaultProps = {
  home: false,
  fixed: false,
  withPadding: false,
};
