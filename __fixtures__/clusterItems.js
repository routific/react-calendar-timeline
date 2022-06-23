
/*
    Dates in comments are all PDT.
    Easy to convert MS: https://currentmillis.com/
*/
export const clusterSettings = {
  tinyItemSize: 0.2,
  clusteringRange: 0.5,
  sequencialClusterTinyItemsOnly: true,
  disableClusteringBelowTime: 1000 * 60 * 60 * 12,
  enableIncreasedHoverOnTinyItem: true,
};

export const clusterSettingsLarge = {
  tinyItemSize: 10,
  clusteringRange: 20,
  sequencialClusterTinyItemsOnly: true,
  enableIncreasedHoverOnTinyItem: true,
};

export const clusterSettingsLgDisableBelow23Hours = {
  tinyItemSize: 10,
  clusteringRange: 20,
  sequencialClusterTinyItemsOnly: true,
  disableClusteringBelowTime: 1000 * 60 * 60 * 24,
  enableIncreasedHoverOnTinyItem: true,
};
export const canvasSize = {
  msBeginingOfDay: 1654498800000, // Mon Jun 06 2022 00:00:00
  msMiddleOfDay: 1654542000000, // Mon Jun 06 2022 12:00:00
  msEndOfDay: 1654585199000, // Mon Jun 06 2022 23:59:59
  ms1Week: 1655103600000, // Wed Jun 08 2022 00:00:00
};

export const clusterGroup = [{ id: '1' }];

export const itemsToCluster = [

  {
    id: '1',
    start_time: 1654527600000, // Mon Jun 06 2022 08:00:00
    end_time: 1654529400000, // Mon Jun 06 2022 08:30:00
    group: '1',
    canCluster: true,
    title: 'Item 1',
  },
  {
    id: '2',
    start_time: 1654530300000, // Mon Jun 06 2022 08:45:00
    end_time: 1654531200000, // Mon Jun 06 2022 09:00:00
    group: '1',
    canCluster: true,
    title: 'Item 2',
  },
  {
    id: '3',
    start_time: 1654534800000, // Mon Jun 06 2022 10:00:00
    end_time: 1654535400000, // Mon Jun 06 2022 10:10:00
    group: '1',
    canCluster: true,
    title: 'Item 3',
  },
  {
    id: '4',
    start_time: 1654542000000, // Mon Jun 06 2022 12:00:00
    end_time: 1654542600000, // Mon Jun 06 2022 12:10:00
    group: '1',
    canCluster: true,
    title: 'Item 4',
  },
  {
    id: '5',
    start_time: 1654545600000, // Mon Jun 06 2022 13:00:00
    end_time: 1654547400000, // Mon Jun 06 2022 13:30:00
    group: '1',
    canCluster: true,
    title: 'Item 5',
  },
];

export const clusterData = [
  {
    id: 'Cluster 1-1-2',
    start_time: 1654527600000,
    end_time: 1654531200000,
    group: '1',
    title: 'Cluster 1-1-1',
    isCluster: true,
    canCluster: false,
    items: [{
      id: '1',
      start_time: 1654527600000, // Mon Jun 06 2022 08:00:00
      end_time: 1654529400000, // Mon Jun 06 2022 08:30:00
      group: '1',
      canCluster: true,
      title: 'Item 1',
    },
    {
      id: '2',
      start_time: 1654530300000, // Mon Jun 06 2022 08:45:00
      end_time: 1654531200000, // Mon Jun 06 2022 09:00:00
      group: '1',
      canCluster: true,
      title: 'Item 2',
    },
    ],
  },
];
