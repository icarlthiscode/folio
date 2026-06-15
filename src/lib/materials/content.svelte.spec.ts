import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  it,
  expect,
  vi,
} from 'vitest';
import { page } from 'vitest/browser';
import { cleanup, render } from '@testing-library/svelte';

import { loadStyles } from '$lib/tests/browser';
import {
  makeComponent,
  addChildComponent,
  wrapOriginal,
} from '$lib/tests/component';

import Background from './background.svelte';
import Content from './content.svelte';

vi.mock('./background.svelte', async original => ({
  default : await wrapOriginal(original, { testId : 'background' }),
}));

const TestContent = makeComponent({
  testId : 'content',
  style : {
    width : '100%',
    height : '100px',
  },
});

beforeAll(async () => await loadStyles());

beforeEach(() => {
  vi.clearAllMocks();
  cleanup();
});

afterAll(() => { vi.restoreAllMocks(); });

describe('Content', () => {
  it('renders content layout', async () => {
    await page.viewport(768, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;

    const { container } = render(Content, {
      section : 'profile',
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    expect(section.className).toMatch(/section-profile/);

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('flex-start');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedPadding);
  });

  it('renders top navigation content layout', async () => {
    await page.viewport(768, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;

    const { container } = render(Content, {
      hasTopNav : true,
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedSpacing / 2);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedPadding);
  });

  it('renders mobile content layout', async () => {
    await page.viewport(767, 1024);
    const expectedPadding = 64;

    const { container } = render(Content, { children : TestContent });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('--layout-spacing', `${expectedPadding / 2}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('flex-start');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + (expectedPadding / 2));
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding / 2);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedPadding);
  });

  it('renders top navigation mobile content layout', async () => {
    await page.viewport(767, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;

    const { container } = render(Content, {
      hasTopNav : true,
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('--layout-spacing', `${2 * expectedSpacing}px`);

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedSpacing / 2);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedPadding);
  });

  it('renders content vertically centered layout', async () => {
    await page.viewport(768, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;

    const { container } = render(
      Content,
      { justification : 'centre', children : TestContent },
    );

    container.style.setProperty('display', 'flex');
    container.style.setProperty('height', '500px');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('center');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toBeGreaterThan(containerBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toBeLessThan(containerBounds.bottom - expectedPadding);
    expect(contentBounds.top - containerBounds.top)
      .toEqual(containerBounds.bottom - contentBounds.bottom);
  });

  it('renders content vertically centered layout', async () => {
    await page.viewport(768, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;

    const { container } = render(
      Content,
      { justification : 'centre', children : TestContent },
    );

    container.style.setProperty('display', 'flex');
    container.style.setProperty('height', '500px');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('center');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(containerBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(containerBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toBeGreaterThan(containerBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toBeLessThan(containerBounds.bottom - expectedPadding);
    expect(contentBounds.top - containerBounds.top)
      .toEqual(containerBounds.bottom - contentBounds.bottom);
  });

  it('renders content vertically centered layout with top nav', async () => {
    await page.viewport(768, 1024);
    const expectedPadding = 32;

    const { container } = render(Content, {
      justification : 'centre',
      hasTopNav : true,
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('height', '500px');
    container.style.setProperty('--layout-spacing', `${expectedPadding / 2}px`);

    const navContent = page
      .elementLocator(container).getByTestId('content').element();
    expect(navContent).toBeInTheDocument();

    const layout = navContent.parentNode as HTMLElement;
    expect(layout).toBeInTheDocument();

    const placeholder = layout.children[1] as HTMLElement;
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).not.toBe(navContent);

    const layoutStyle = getComputedStyle(layout);

    const containerBounds = container.getBoundingClientRect();
    const navBounds = navContent.getBoundingClientRect();
    const placeholderBounds = placeholder.getBoundingClientRect();

    expect(navBounds.top)
      .toBeCloseTo(containerBounds.top + (expectedPadding / 4), 1);
    expect(placeholderBounds.bottom)
      .toBeCloseTo(containerBounds.bottom - expectedPadding, 1);

    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('space-between');
  });

  it('renders content vertically centered layout with bottom nav', async () => {
    await page.viewport(768, 1024);
    const expectedPadding = 32;

    const { container } = render(Content, {
      justification : 'centre',
      hasBottomNav : true,
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('height', '500px');
    container.style.setProperty('--layout-spacing', `${expectedPadding / 2}px`);

    const navContent = page
      .elementLocator(container).getByTestId('content').element();
    expect(navContent).toBeInTheDocument();

    const layout = navContent.parentNode as HTMLElement;
    expect(layout).toBeInTheDocument();

    const placeholder = layout.children[0] as HTMLElement;
    expect(placeholder).toBeInTheDocument();
    expect(placeholder).not.toBe(navContent);

    const layoutStyle = getComputedStyle(layout);

    const containerBounds = container.getBoundingClientRect();
    const navBounds = navContent.getBoundingClientRect();
    const placeholderBounds = placeholder.getBoundingClientRect();

    expect(placeholderBounds.top)
      .toBeCloseTo(containerBounds.top + expectedPadding, 1);
    expect(navBounds.bottom)
      .toBeCloseTo(containerBounds.bottom - expectedPadding, 1);

    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('space-between');
  });

  it('restricts content to maximum width', async () => {
    await page.viewport(768, 1024);
    const expectedWidth = 600;
    const expectedPadding = 32;

    const { container } = render(Content, {
      section : 'profile',
      children : TestContent,
    });

    container.style.setProperty('display', 'flex');
    container.style.setProperty('width', '100%');
    container.style.setProperty('--max-page-width', `${expectedWidth}px`);
    container.style.setProperty('--layout-spacing', `${expectedPadding / 2}px`);

    const section = container.querySelector('section') as HTMLElement;
    expect(section).toBeInTheDocument();

    const background = page.elementLocator(container).getByTestId('background');
    const content = background.getByTestId('content');
    await expect.element(background).toBeInTheDocument();
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    expect(section.className).toMatch(/section-profile/);

    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('flex-start');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const containerBounds = container.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    expect(contentBounds.width).toEqual(expectedWidth);
    expect(contentBounds.left - containerBounds.left)
      .toEqual(containerBounds.right - contentBounds.right);
    expect(contentBounds.top)
      .toEqual(containerBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toBeLessThanOrEqual(containerBounds.bottom - expectedPadding);
  });

  it('displays bottom border', async () => {
    await page.viewport(768, 1024);
    const expectedSpacing = 32;
    const expectedPadding = 2 * expectedSpacing;
    const expectedBorder = 2;

    const { container } = render(Content, {
      section : 'profile',
      children : TestContent,
    });
    addChildComponent(container, Content);

    container.style.setProperty('display', 'flex');
    container.style.setProperty('flex-direction', 'column');
    container.style.setProperty('width', '100%');
    container.style.setProperty('--layout-spacing', `${expectedSpacing}px`);
    container.style.setProperty('--border-width', `${expectedBorder}px`);
    container.style.setProperty('--border-colour', '#042');

    const section = container.children[0] as HTMLElement;
    expect(section).toBeInTheDocument();
    const additionalContent = container.children[1] as HTMLElement;
    expect(additionalContent).toBeInTheDocument();

    const content = page.elementLocator(section).getByTestId('content');
    await expect.element(content).toBeInTheDocument();

    const layout = content.element().parentElement as HTMLElement;
    await expect.element(layout).toBeInTheDocument();

    const sectionStyle = getComputedStyle(section);
    expect(sectionStyle.borderBottomWidth).toBe(`${expectedBorder}px`);
    expect(sectionStyle.borderTopStyle).toBe('none');
    expect(sectionStyle.borderRightStyle).toBe('none');
    expect(sectionStyle.borderLeftStyle).toBe('none');
    expect(sectionStyle.borderBottomStyle).toBe('solid');
    expect(sectionStyle.borderBottomColor).toBe('rgb(0, 68, 34)');
    const layoutStyle = getComputedStyle(layout);
    expect(layoutStyle.display).toBe('flex');
    expect(layoutStyle.flexDirection).toBe('column');
    expect(layoutStyle.justifyContent).toBe('flex-start');
    expect(layoutStyle.alignItems).toBe('flex-start');

    const sectionBounds = section.getBoundingClientRect();
    const contentBounds = content.element().getBoundingClientRect();
    const additionalContentBounds = additionalContent.getBoundingClientRect();
    expect(contentBounds.left)
      .toEqual(sectionBounds.left + expectedPadding);
    expect(contentBounds.right)
      .toEqual(sectionBounds.right - expectedPadding);
    expect(contentBounds.top)
      .toEqual(sectionBounds.top + expectedPadding);
    expect(contentBounds.bottom)
      .toEqual(sectionBounds.bottom - expectedPadding - expectedBorder);
    expect(additionalContentBounds.top)
      .toEqual(sectionBounds.bottom - expectedBorder);
  });

  it('stretches first content to fill layout', async () => {
    await page.viewport(768, 1024);
    const expectedHeight = 100;

    const { container } = render(Content);
    addChildComponent(container, Content);

    container.style.setProperty('display', 'flex');
    container.style.setProperty('flex-direction', 'column');
    container.style.setProperty('height', `${3 * expectedHeight}px`);
    container.style.setProperty('--layout-spacing', `${expectedHeight / 4}px`);

    const first = container.children[0] as HTMLElement;
    const second = container.children[1] as HTMLElement;
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();

    const firstBounds = first.getBoundingClientRect();
    const secondBounds = second.getBoundingClientRect();

    expect(firstBounds.height).toEqual(2 * expectedHeight);
    expect(secondBounds.height).toEqual(expectedHeight);
  });

  it('hides background when showBackground is false', () => {
    render(Content, { showBackground : false });

    expect(Background).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ show : false }),
    );
  });
});
