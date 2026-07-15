import { Language } from '../types';

export const translations = {
  en: {
    title: { main: "Boohee", sub: "Scale Web" },
    connect: "Connect Scale",
    disconnect: "Disconnect",
    status: {
      offline: "OFFLINE",
      connected: "CONNECTED",
      connecting: "CONNECTING...",
      measuring: "MEASURING...",
      locked: "LOCKED",
      ready: "Ready",
      lastResult: "Last Result",
      deviceStatus: "Device Status",
      streaming: "Streaming Data...",
      held: "Displaying Saved/Held Data",
      waiting: "Waiting for data...",
      rawPacket: "Raw Packet"
    },
    metrics: {
      weight: "Weight",
      bmi: "BMI",
      bodyFat: "Body Fat",
      bodyComposition: "Body Composition",
      leanMass: "Lean Mass",
      water: "Water Rate",
      bmr: "BMR",
      estimateNotice: "Body composition varies with hydration, meals, exercise, and foot contact. Use trends measured under similar conditions; these values are not for medical diagnosis.",
      impedance: "Impedance",
      rawFat: "Device Estimate",
      desc: {
        bmi: "Body Mass Index",
        bodyFat: "Estimated body fat",
        bodyFatBia: "Impedance-adjusted estimate",
        bodyFatFallback: "Demographic estimate",
        leanMass: "Body weight excluding fat",
        water: "Total Body Water",
        bmr: "Basal Metabolic Rate"
      }
    },
    evaluation: {
      underweight: "Underweight",
      normal: "Normal",
      overweight: "Overweight",
      obese: "Obese",
      low: "Low",
      high: "High",
      veryHigh: "Very High"
    },
    profile: {
      title: "User Profile",
      desc: "Accurate body composition analysis requires correct personal details.",
      gender: "Gender",
      male: "Male",
      female: "Female",
      height: "Height (cm)",
      age: "Age",
      save: "Save & Close",
      userLabel: "User"
    },
    history: {
      title: "History",
      clear: "Clear All",
      delete: "Delete record",
      empty: "No history yet. Connect scale and weigh yourself!",
      cols: {
        date: "Date & Time",
        weight: "Weight",
        bmi: "BMI",
        fat: "Fat %",
        actions: "Actions"
      },
      confirmClear: "Clear all history?"
    },
    onboarding: {
      welcome: "Welcome",
      desc: "Let's set up your profile for accurate body analysis.",
      genderQ: "What is your gender?",
      ageQ: "How old are you?",
      ageDesc: "Used to calculate metabolic rate.",
      heightQ: "How tall are you?",
      heightDesc: "Essential for BMI calculation.",
      next: "Next Step",
      finish: "Finish Setup",
      back: "Previous step",
      years: "years",
      cm: "cm"
    },
    footer: {
      copyright: "Copyright © 2024–2026 CkarFly Project. All rights reserved.",
      disclaimer: "Disclaimer: This project is an independent open-source initiative and is not affiliated with, endorsed by, or associated with Boohee Health (薄荷健康) or its subsidiaries. All product names, logos, and brands are property of their respective owners."
    },
    controls: {
        autoSave: "AUTO-SAVE",
        saveReading: "Save Reading",
        language: "Switch language",
        close: "Close"
    },
    errors: {
        dismiss: "Dismiss",
        connectFail: "Failed to connect to the scale. Wake it up and try again.",
        unsupported: "Web Bluetooth is not supported. Use Chrome or Edge on a secure page."
    },
    instructions: {
        readyTitle: "Ready to Measure",
        readyText: "Make sure your device's Bluetooth is on. Step on the scale to wake it up, then click Connect."
    }
  },
  zh: {
    title: { main: "薄荷", sub: "体脂秤 Web" },
    connect: "连接体脂秤",
    disconnect: "断开连接",
    status: {
      offline: "离线",
      connected: "已连接",
      connecting: "连接中...",
      measuring: "测量中...",
      locked: "已锁定",
      ready: "准备就绪",
      lastResult: "上次结果",
      deviceStatus: "设备状态",
      streaming: "正在接收数据...",
      held: "显示已保存/锁定数据",
      waiting: "等待数据...",
      rawPacket: "原始数据包"
    },
    metrics: {
      weight: "体重",
      bmi: "BMI",
      bodyFat: "体脂率",
      bodyComposition: "身体成分",
      leanMass: "去脂体重率",
      water: "水分率",
      bmr: "基础代谢",
      estimateNotice: "身体成分会受饮水、进食、运动和足部接触影响。请在相近条件下观察长期趋势，结果不用于医疗诊断。",
      impedance: "阻抗",
      rawFat: "设备原始估值",
      desc: {
        bmi: "身体质量指数",
        bodyFat: "体脂估算值",
        bodyFatBia: "结合阻抗修正的估算",
        bodyFatFallback: "基于 BMI、年龄和性别估算",
        leanMass: "体重中非脂肪部分",
        water: "身体总水分",
        bmr: "基础代谢率"
      }
    },
    evaluation: {
      underweight: "体重过轻",
      normal: "正常",
      overweight: "超重",
      obese: "肥胖",
      low: "偏低",
      high: "偏高",
      veryHigh: "严重偏高"
    },
    profile: {
      title: "用户档案",
      desc: "准确的体脂分析需要正确的个人信息。",
      gender: "性别",
      male: "男",
      female: "女",
      height: "身高 (cm)",
      age: "年龄",
      save: "保存并关闭",
      userLabel: "用户"
    },
    history: {
      title: "历史记录",
      clear: "清空",
      delete: "删除记录",
      empty: "暂无记录。请连接体脂秤并称重！",
      cols: {
        date: "日期时间",
        weight: "体重",
        bmi: "BMI",
        fat: "体脂率",
        actions: "操作"
      },
      confirmClear: "确定清空所有历史记录吗？"
    },
    onboarding: {
      welcome: "欢迎使用",
      desc: "让我们设置您的个人资料以进行准确的身体分析。",
      genderQ: "您的性别？",
      ageQ: "您的年龄？",
      ageDesc: "用于计算基础代谢率。",
      heightQ: "您的身高？",
      heightDesc: "用于计算 BMI。",
      next: "下一步",
      finish: "完成设置",
      back: "上一步",
      years: "岁",
      cm: "厘米"
    },
    footer: {
      copyright: "版权所有 © 2024–2026 CkarFly Project。",
      disclaimer: "免责声明：本项目是一个独立的开源计划，不隶属于薄荷健康（Boohee Health）或其子公司，也未得到其认可或关联。所有产品名称、徽标和品牌均为其各自所有者的财产。"
    },
    controls: {
        autoSave: "自动保存",
        saveReading: "保存数据",
        language: "切换语言",
        close: "关闭"
    },
    errors: {
        dismiss: "忽略",
        connectFail: "连接体脂秤失败，请唤醒设备后重试。",
        unsupported: "当前浏览器不支持 Web Bluetooth，请在安全页面中使用 Chrome 或 Edge。"
    },
    instructions: {
        readyTitle: "准备测量",
        readyText: "请确保您的设备蓝牙已开启。踩上体脂秤唤醒它，然后点击连接。"
    }
  }
};

export const t = (key: string, lang: Language): string => {
  const keys = key.split('.');
  let current: unknown = translations[lang];
  for (const k of keys) {
    if (typeof current !== 'object' || current === null || !(k in current)) return key;
    current = (current as Record<string, unknown>)[k];
  }
  return typeof current === 'string' ? current : key;
};
