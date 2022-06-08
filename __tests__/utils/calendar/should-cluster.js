import { shouldCluster } from 'lib/utility/calendar';
import {
  clusterSettings, canvasSize,
} from '../../../__fixtures__/clusterItems';

describe('Checking if we should be clustering items on the timline', () => {
  it('Should cluster if there are settings', () => {
    const result = shouldCluster(clusterSettings, canvasSize.msEndOfDay - canvasSize.msBeginingOfDay);
    expect(result).toBeTruthy();
  });

  it('Should not cluster if there are no settings', () => {
    const result = shouldCluster(undefined, canvasSize.msEndOfDay - canvasSize.msBeginingOfDay);
    expect(result).toBeFalsy();
  });

  it('Should not cluster if the canvas duration is smaller than disableClusteringBelowTime setting', () => {
    const result = shouldCluster(undefined, canvasSize.msEndOfDay - canvasSize.msMiddleOfDay);
    expect(result).toBeFalsy();
  });
});
