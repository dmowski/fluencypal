import { logoutThenGoToLanding } from './logoutThenGoToLanding';

describe('logoutThenGoToLanding', () => {
  it('signs out before leaving the app origin', async () => {
    const order: string[] = [];
    const logout = jest.fn(async () => {
      order.push('logout');
    });
    const assignLocation = jest.fn((url: string) => {
      order.push(`redirect:${url}`);
    });

    await logoutThenGoToLanding(logout, 'https://www.fluencypal.com/', assignLocation);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(assignLocation).toHaveBeenCalledWith('https://www.fluencypal.com/');
    expect(order).toEqual(['logout', 'redirect:https://www.fluencypal.com/']);
  });

  it('does not redirect if sign-out fails', async () => {
    const assignLocation = jest.fn();

    await expect(
      logoutThenGoToLanding(
        async () => {
          throw new Error('sign-out failed');
        },
        'https://www.fluencypal.com/',
        assignLocation,
      ),
    ).rejects.toThrow('sign-out failed');

    expect(assignLocation).not.toHaveBeenCalled();
  });
});
