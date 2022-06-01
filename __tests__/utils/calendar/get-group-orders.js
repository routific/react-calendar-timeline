import { getGroupOrders } from 'lib/utility/calendar';
import { defaultKeys } from 'lib/default-config';
import { groups } from '../../../__fixtures__/itemsAndGroups';

describe('getGroupOrders', () => {
  it('works as expected', () => {
    expect(getGroupOrders(groups, defaultKeys)).toMatchSnapshot();
  });
});
