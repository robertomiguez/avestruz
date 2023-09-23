import { mount } from '@vue/test-utils';
import Feed from '@/views/Feed.vue';
import { describe, expect, test } from 'vitest';

describe('Feed.vue', () => {
  test('renders Feed', () => {
    const wrapper = mount(Feed);
    expect(wrapper.text()).toMatch('Feed');
  });
});
