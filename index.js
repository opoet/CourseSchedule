const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);

const weekDays = [7, 1, 2, 3, 4, 5, 6];
const timeList = {
  am: [
    ["08:10", "08:55"],
    ["09:05", "09:50"],
    ["10:10", "10:55"],
    ["11:05", "11:50"],
  ],
  pm: [
    ["14:00", "14:45"],
    ["14:55", "15:40"],
    ["16:00", "16:45"],
    ["16:55", "17:40"],
  ],
};

// 获取当前周
let getNowWeek = (now, back) => {
  let nowDate = now;
  let backDate = back;
  let nowWeek = Math.ceil(
    Math.ceil(
      (nowDate - backDate) / (24 * 60 * 60 * 1000) +
        (weekDays[backDate.day()] - 1)
    ) / 7
  );
  return nowWeek;
};

// 获取当天课程
let getDayCourse = (classSchedule, nowWeek, toDay) => {
  let tdcs = classSchedule.filter(
    (item) => item.week.includes(nowWeek) && item.day === toDay
  );
  let allCourseCount = 0;

  tdcs.forEach((item) => {
    allCourseCount += item.sectionContinue;
  });

  let amCourse = tdcs
    .filter((item) => item.sectionStart <= 4)
    .sort((a, b) => a.sectionStart - b.sectionStart);
  let pmCourse = tdcs
    .filter((item) => item.sectionStart >= 5)
    .sort((a, b) => a.sectionStart - b.sectionStart);

  let courseInfo = (course) => {
    let courseCount = 0;
    let courseState = [0, 0, 0, 0];
    course.forEach((item) => {
      courseCount += item.sectionContinue;
      for (let i = 0; i < item.sectionContinue; i++) {
        if (item.sectionStart < 4) {
          courseState[item.sectionStart - 1 + i] = 1;
        } else {
          courseState[item.sectionStart - 1 + i - 4] = 1;
        }
      }
    });
    return {
      count: courseCount,
      state: courseState,
    };
  };

  return {
    data: dayjs().utc(8).add(1, "day").format("YY/MM/DD"),
    allCount: allCourseCount,
    allCourse: tdcs,
    am: {
      part: "am",
      course: amCourse,
      info: courseInfo(amCourse),
    },
    pm: {
      part: "pm",
      course: pmCourse,
      info: courseInfo(pmCourse),
    },
  };
};

let makeMessage = (obj) => {
  let prefix = `📢 *明日课程* ( ${obj.data} )\n\n`;
  let courseMsg = " × 明天没有课 🎉\n";

  let partMsg = (part) => {
    let { count } = part.info;
    let { course } = part;
    let pMsg = "";
    if (count != 0) {
      course.forEach((item) => {
        pMsg += `${item.sectionContinue} × ${item.name}  [${item.position}]\n`;
      });
    } else {
      pMsg = ` × 没有课 🎉\n`;
    }
    return pMsg;
  };

  let timeInterval = (part, list) => {
    let { state } = part.info;
    let startIndex = state.indexOf(1);
    let endIndex = state.lastIndexOf(1);
    let startTime = list[startIndex][0];
    let endTime = list[endIndex][1];
    return `( ${startTime}-${endTime} )`;
  };

  let symbolHint = (part) => {
    let { state } = part.info;
    let y = "●",
      n = "○";
    let symbolHint = "";
    for (let i of state) {
      // i ? (symbolHint += y) : (symbolHint += n);
      if(i){
        symbolHint += y;
      }else{
        symbolHint += n;
      }
    }
    return symbolHint;
  };

  if (obj.allCount != 0) {
    let am = `🌄 *上午* ${
      obj.am.info.count != 0 ? `${timeInterval(obj.am, timeList.am)}` : ""
    }`;
    let pm = `☀️ *下午* ${
      obj.pm.info.count != 0 ? `${timeInterval(obj.pm, timeList.pm)}` : ""
    }`;
    courseMsg = `${am}\n${symbolHint(obj.am)}\n${partMsg(
      obj.am
    )}\n${pm}\n${symbolHint(obj.pm)}\n${partMsg(obj.pm)}`;
  }
  return `${prefix}${courseMsg}`;
};

(() => {
  // const classSchedule = require('./ClassSchedule.json')
  const classSchedule = require("./testCS.json");
  const { tgBot, qmsgBot } = require("./sendNotify");

  const { process } = require("./env");

  const BACK_DAY = process.env.back_day; //返校日
  const BOT_TOKEN = process.env.bot_token; //机器人token
  const CHIT_ID = process.env.chat_id; //群组ID

  const QMSG_TYPE = "send"; //推送到个人或群组 send group
  const QMSG_KEY = process.env.qmsg_key; //qmsg 机器人key
  const QQ_NUM = process.env.qq_num; //QQ号或群号

  const nowDate = dayjs().utc(8);
  const backDate = dayjs(BACK_DAY).utc(8);
  let nowWeek = getNowWeek(nowDate.add(1, "day"), backDate);
  console.log(nowWeek);
  let toDay = weekDays[nowDate.add(1, "day").day()];
  let message = makeMessage(getDayCourse(classSchedule, nowWeek, toDay));
  console.log(message);
  // tgBot(BOT_TOKEN,CHIT_ID,message)
  // qmsgBot(QMSG_TYPE,QMSG_KEY,QQ_NUM,message)
})();
