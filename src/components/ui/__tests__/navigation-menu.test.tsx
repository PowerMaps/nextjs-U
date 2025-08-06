import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from '../navigation-menu';

describe('Navigation Menu Component', () => {
  it('renders navigation menu correctly', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">
                <NavigationMenuLink href="/product1">Product 1</NavigationMenuLink>
                <NavigationMenuLink href="/product2">Product 2</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('shows navigation menu content on trigger click', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">
                <NavigationMenuLink href="/service1">Service 1</NavigationMenuLink>
                <NavigationMenuLink href="/service2">Service 2</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    const trigger = screen.getByText('Services');
    fireEvent.click(trigger);

    expect(screen.getByText('Service 1')).toBeInTheDocument();
    expect(screen.getByText('Service 2')).toBeInTheDocument();
  });

  it('renders navigation menu with multiple items', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">
                <NavigationMenuLink href="/products">All Products</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Services</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">
                <NavigationMenuLink href="/services">All Services</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href="/about">About</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('renders navigation menu trigger with chevron icon', () => {
    const { container } = render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText('Menu')).toBeInTheDocument();
    
    // Check for chevron icon
    const chevronIcon = container.querySelector('svg');
    expect(chevronIcon).toBeInTheDocument();
    expect(chevronIcon).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders navigation menu links with href attributes', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Links</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="p-4">
                <NavigationMenuLink href="/page1">Page 1</NavigationMenuLink>
                <NavigationMenuLink href="/page2">Page 2</NavigationMenuLink>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    const trigger = screen.getByText('Links');
    fireEvent.click(trigger);

    const page1Link = screen.getByText('Page 1');
    const page2Link = screen.getByText('Page 2');

    expect(page1Link).toHaveAttribute('href', '/page1');
    expect(page2Link).toHaveAttribute('href', '/page2');
  });

  it('handles navigation menu trigger hover states', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Hover Me</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div>Content</div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    const trigger = screen.getByText('Hover Me');
    
    fireEvent.mouseEnter(trigger);
    expect(trigger).toBeInTheDocument();
    
    fireEvent.mouseLeave(trigger);
    expect(trigger).toBeInTheDocument();
  });

  it('renders navigation menu with custom content', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Custom</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid gap-3 p-6 md:w-[400px] lg:w-[500px]">
                <div className="row-span-3">
                  <NavigationMenuLink href="/featured">
                    <div className="mb-2 mt-4 text-lg font-medium">
                      Featured
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Check out our featured content
                    </p>
                  </NavigationMenuLink>
                </div>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    const trigger = screen.getByText('Custom');
    fireEvent.click(trigger);

    expect(screen.getByText('Featured')).toBeInTheDocument();
    expect(screen.getByText('Check out our featured content')).toBeInTheDocument();
  });

  it('applies navigationMenuTriggerStyle correctly', () => {
    const triggerClass = navigationMenuTriggerStyle();
    expect(typeof triggerClass).toBe('string');
    expect(triggerClass).toContain('inline-flex');
    expect(triggerClass).toContain('items-center');
    expect(triggerClass).toContain('justify-center');
  });

  it('renders navigation menu with indicator', () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>With Indicator</NavigationMenuTrigger>
            <NavigationMenuContent>
              <div>Content</div>
            </NavigationMenuContent>
            <NavigationMenuIndicator />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );

    expect(screen.getByText('With Indicator')).toBeInTheDocument();
  });
});