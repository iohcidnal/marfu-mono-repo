import { act } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import MembersDashboard from './members-dashboard';

const render = renderWithProviders(
  <MembersDashboard currentUserId="fake-user-id" dashboardItems={[]} />
);

describe('SignIn', () => {
  it('should render properly', async () => {
    let rendered;
    await act(async () => {
      rendered = render();
    });
    expect(rendered.asFragment()).toMatchSnapshot();
  });

  it.todo('cover other lines');
});
