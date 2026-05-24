/**
 * 同学数据
 * 添加新同学：复制一条记录，修改字段即可
 * photo: 将照片放入 photos/ 目录，填写相对路径
 */
const classmates = [
  {
    id: "zhangsan",
    name: "张三",
    city: "北京",
    coords: [39.9042, 116.4074],
    field: "互联网/IT",
    company: "某科技公司",
    gradYear: 2020,
    photo: "photos/zhangsan.svg"
  },
  {
    id: "lisi",
    name: "李四",
    city: "上海",
    coords: [31.2304, 121.4737],
    field: "金融",
    company: "某银行",
    gradYear: 2020,
    photo: "photos/lisi.svg"
  },
  {
    id: "wangwu",
    name: "王五",
    city: "深圳",
    coords: [22.5431, 114.0579],
    field: "互联网/IT",
    company: "某互联网公司",
    gradYear: 2021,
    photo: "photos/wangwu.svg"
  },
  {
    id: "zhaoliu",
    name: "赵六",
    city: "杭州",
    coords: [30.2741, 120.1551],
    field: "电商",
    company: "某电商平台",
    gradYear: 2019,
    photo: "photos/zhaoliu.svg"
  },
  {
    id: "sunqi",
    name: "孙七",
    city: "成都",
    coords: [30.5728, 104.0668],
    field: "教育",
    company: "某教育机构",
    gradYear: 2021,
    photo: "photos/sunqi.svg"
  },
  {
    id: "zhouba",
    name: "周八",
    city: "广州",
    coords: [23.1291, 113.2644],
    field: "制造业",
    company: "某制造企业",
    gradYear: 2020,
    photo: "photos/zhouba.svg"
  },
  {
    id: "wujiu",
    name: "吴九",
    city: "武汉",
    coords: [30.5928, 114.3055],
    field: "医疗",
    company: "某医院",
    gradYear: 2022,
    photo: "photos/wujiu.svg"
  },
  {
    id: "zhengshi",
    name: "郑十",
    city: "南京",
    coords: [32.0603, 118.7969],
    field: "互联网/IT",
    company: "某软件公司",
    gradYear: 2019,
    photo: "photos/zhengshi.svg"
  }
];

/** 常用城市坐标，添加同学时可参考 */
const cityCoords = {
  北京: [39.9042, 116.4074],
  上海: [31.2304, 121.4737],
  广州: [23.1291, 113.2644],
  深圳: [22.5431, 114.0579],
  杭州: [30.2741, 120.1551],
  成都: [30.5728, 104.0668],
  武汉: [30.5928, 114.3055],
  南京: [32.0603, 118.7969],
  西安: [34.3416, 108.9398],
  重庆: [29.4316, 106.9123],
  天津: [39.3434, 117.3616],
  苏州: [31.2989, 120.5853],
  长沙: [28.2282, 112.9388],
  郑州: [34.7466, 113.6254],
  青岛: [36.0671, 120.3826],
  厦门: [24.4798, 118.0894],
  大连: [38.9140, 121.6147],
  沈阳: [41.8057, 123.4315],
  哈尔滨: [45.8038, 126.5350],
  昆明: [25.0389, 102.7183]
};
