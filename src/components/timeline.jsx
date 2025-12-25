import React, { useState } from 'react';
import { useDarkMode } from '@/contexts/DarkModeContext';

const Timeline = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { isDarkMode } = useDarkMode();

  const timelineData = [
    {
      year: 1884,
      title: "근대 최초 민간 출판·인쇄사 창간사 설립",
      description: "홍원태",
      details: "광인사(廣印社)는 1884년에 개화된 근대 최초의 민간 활자 출판사이자 인쇄소다. 일명 광인국(廣印局)이라고도 한다."
    },
    {
      year: 1885,
      title: "한성전보총국 개국",
      description: "석재필",
      details: "이럴 적 거익을 돌아켜 보니, 읽마는 생일머다 조금 늑별한 족잡 카드를 받은 했다."
    },
    {
      year: 1889,
      title: "초기 DTP(Desktop Publishing) 발생(출판)이 시작됨",
      description: "",
      details: "알더스(Aldus) 페이지메이커(PageMaker) 출시"
    },
    {
      year: 1914,
      title: "벡터 그래픽스의 초기 단계",
      description: "",
      details: "캠브리지 대학교에서 첫 CRT(Cathode Ray Tube) 디스플레이 제작"
    },
    {
      year: 1915,
      title: "첫 상업용 폰트",
      description: "",
      details: "ATF에서 첫 상업용 폰트 개발"
    },
    {
      year: 1920,
      title: "디지털 폰트 설계 연구",
      description: "",
      details: "실용적 디지털 폰트 설계 연구가 시작됨"
    },
    {
      year: 1927,
      title: "전자 빔 레이(Electronic Ray Tube) 디스플레이 기술 개발",
      description: "",
      details: "독일의 카를 브라운이 개발"
    },
    {
      year: 1928,
      title: "폴 레너(Paul Renner) 푸투라 서체 제작",
      description: "",
      details: "기하학적이고 현대적인 디자인의 산세리프 서체"
    },
    {
      year: 1932,
      title: "스탠리 모리슨(Stanley Morison) 타임스 뉴 로만(Times New Roman) 서체 제작",
      description: "",
      details: "타임스지를 위해 디자인된 세리프 서체"
    },
    {
      year: 1933,
      title: "에릭 길(Eric Gill) 길 산스(Gill Sans) 서체 제작",
      description: "",
      details: "BBC 로고 등에 사용된 영국 스타일의 산세리프 서체"
    },
    {
      year: 1935,
      title: "IBM 전기타자기 개발",
      description: "",
      details: "전기를 이용한 타자기가 상용화"
    },
    {
      year: 1938,
      title: "복스(Vox) 폰트 분류 체계",
      description: "",
      details: "막시밀리앙 복스가 서체 분류 체계 제안"
    },
    {
      year: 1947,
      title: "트랜지스터(Transistor) 발명",
      description: "",
      details: "벨 연구소에서 발명, 디지털 시대의 시작"
    },
    {
      year: 1948,
      title: "첫 디지털 컴퓨터 에니악(ENIAC) 개발",
      description: "",
      details: "현대 컴퓨터의 시초가 됨"
    },
    {
      year: 1952,
      title: "Emitting Diode 기술",
      description: "",
      details: "LED 기술 개발의 토대가 됨"
    },
    {
      year: 1953,
      title: "NTSC(National Television System Committee) 표준 승인",
      description: "",
      details: "컬러 TV 방송 표준이 확립됨"
    },
    {
      year: 1954,
      title: "포토타입세팅(Phototypesetting) 시스템 상용화",
      description: "",
      details: "광학 방식의 활자 조판 기술"
    },
    {
      year: 1957,
      title: "맥스 미딩거(Max Miedinger) 헬베티카(Helvetica) 서체 제작",
      description: "",
      details: "세계에서 가장 많이 사용되는 산세리프 서체 중 하나"
    },
    {
      year: 1958,
      title: "편집용 타입세팅 시스템",
      description: "",
      details: "전자식 문자 조판 장비 개발"
    },
    {
      year: 1962,
      title: "모리스 풀러(Morris Fuller) 유니버스(Univers) 서체 제작",
      description: "",
      details: "21개의 굵기로 설계된 체계적인 서체"
    },
    {
      year: 1963,
      title: "ASCII 문자 코드 표준화",
      description: "",
      details: "컴퓨터 문자 처리의 기초가 됨"
    },
    {
      year: 1968,
      title: "더글러스 엥겔바트(Douglas Engelbart) 마우스 발명",
      description: "",
      details: "컴퓨터 인터페이스 혁명의 시작"
    },
    {
      year: 1969,
      title: "ARPANET 개발",
      description: "",
      details: "인터넷의 전신이 되는 네트워크"
    },
    {
      year: 1973,
      title: "제록스 파크(Xerox PARC) 비트맵 디스플레이",
      description: "",
      details: "그래픽 사용자 인터페이스(GUI)의 토대"
    },
    {
      year: 1974,
      title: "도널드 커누스(Donald Knuth) TeX 개발 시작",
      description: "",
      details: "수학 및 과학 문서 조판 시스템"
    },
    {
      year: 1976,
      title: "애플(Apple) I 컴퓨터 출시",
      description: "",
      details: "개인용 컴퓨터 시대의 시작"
    },
    {
      year: 1977,
      title: "애플(Apple) II 출시",
      description: "",
      details: "컬러 그래픽을 지원하는 개인용 컴퓨터"
    },
    {
      year: 1981,
      title: "IBM PC 출시",
      description: "",
      details: "개인용 컴퓨터의 표준이 됨"
    },
    {
      year: 1982,
      title: "어도비(Adobe) 창립, 포스트스크립트(PostScript) 개발",
      description: "",
      details: "벡터 기반 페이지 기술 언어"
    },
    {
      year: 1983,
      title: "매킨토시(Macintosh) 개발 시작",
      description: "",
      details: "GUI를 갖춘 개인용 컴퓨터"
    },
    {
      year: 1984,
      title: "애플 매킨토시 출시",
      description: "",
      details: "그래픽 사용자 인터페이스와 마우스를 대중화"
    },
    {
      year: 1985,
      title: "초기 DTP 발생",
      description: "",
      details: "알더스(Aldus) 페이지메이커(PageMaker) 출시, 데스크톱 퍼블리싱 혁명"
    },
    {
      year: 1987,
      title: "쿼크익스프레스(QuarkXPress) 1.0 출시",
      description: "",
      details: "전문 출판 소프트웨어의 표준"
    },
    {
      year: 1988,
      title: "어도비 일러스트레이터(Adobe Illustrator) 출시",
      description: "",
      details: "벡터 그래픽 디자인 도구"
    },
    {
      year: 1989,
      title: "어도비 포토샵(Adobe Photoshop) 1.0 출시",
      description: "",
      details: "이미지 편집의 표준 소프트웨어"
    },
    {
      year: 1990,
      title: "팀 버너스리(Tim Berners-Lee) 월드 와이드 웹(WWW) 발명",
      description: "",
      details: "인터넷의 대중화 시작"
    },
    {
      year: 1991,
      title: "트루타입(TrueType) 폰트 기술",
      description: "",
      details: "애플과 마이크로소프트가 공동 개발"
    },
    {
      year: 1992,
      title: "어도비 아크로뱃(Adobe Acrobat) 출시",
      description: "",
      details: "PDF 형식의 시작"
    },
    {
      year: 1993,
      title: "모자이크(Mosaic) 웹 브라우저 출시",
      description: "",
      details: "최초의 대중적 웹 브라우저"
    },
    {
      year: 1994,
      title: "넷스케이프(Netscape) 네비게이터 출시",
      description: "",
      details: "웹 브라우저 시장을 주도"
    },
    {
      year: 1995,
      title: "윈도우 95 출시",
      description: "",
      details: "GUI 운영체제의 대중화"
    },
    {
      year: 1996,
      title: "CSS(Cascading Style Sheets) 1.0 발표",
      description: "",
      details: "웹 디자인의 표준화"
    },
    {
      year: 1997,
      title: "웹폰트(Web Fonts) 개념 등장",
      description: "",
      details: "인터넷에서 폰트 사용의 시작"
    },
    {
      year: 1998,
      title: "구글(Google) 창립",
      description: "",
      details: "검색 엔진의 혁명"
    },
    {
      year: 1999,
      title: "어도비 인디자인(Adobe InDesign) 1.0 출시",
      description: "",
      details: "현대 출판 디자인의 표준 도구"
    },
    {
      year: 2000,
      title: "어도비 일러스트레이터 9.0",
      description: "",
      details: "투명도 기능 추가"
    },
    {
      year: 2001,
      title: "애플 아이팟(Apple iPod) 출시",
      description: "",
      details: "디지털 미디어 혁명"
    },
    {
      year: 2002,
      title: "웹 2.0 시대 개막",
      description: "",
      details: "사용자 참여형 웹의 시작"
    },
    {
      year: 2004,
      title: "페이스북(Facebook) 출시",
      description: "",
      details: "소셜 미디어 시대 개막"
    },
    {
      year: 2005,
      title: "유튜브(YouTube) 서비스 시작",
      description: "",
      details: "동영상 공유 플랫폼의 시작"
    },
    {
      year: 2006,
      title: "트위터(Twitter) 서비스 시작",
      description: "",
      details: "마이크로 블로깅 혁명"
    },
    {
      year: 2007,
      title: "아이폰(iPhone) 출시",
      description: "",
      details: "스마트폰 시대의 시작"
    },
    {
      year: 2008,
      title: "크롬(Chrome) 브라우저 출시",
      description: "",
      details: "구글의 웹 브라우저"
    },
    {
      year: 2009,
      title: "반응형 웹 디자인 개념 등장",
      description: "",
      details: "다양한 기기에 대응하는 웹 디자인"
    },
    {
      year: 2010,
      title: "아이패드(iPad) 출시",
      description: "",
      details: "태블릿 시장의 개척"
    },
    {
      year: 2011,
      title: "구글 웹폰트(Google Fonts) 공식 출시",
      description: "",
      details: "무료 웹폰트 서비스"
    },
    {
      year: 2012,
      title: "인스타그램(Instagram) 10억 달러에 페이스북에 인수",
      description: "",
      details: "이미지 중심 소셜 미디어"
    },
    {
      year: 2013,
      title: "플랫 디자인(Flat Design) 트렌드",
      description: "",
      details: "단순하고 깔끔한 디자인 유행"
    },
    {
      year: 2014,
      title: "머티리얼 디자인(Material Design) 발표",
      description: "",
      details: "구글의 디자인 철학"
    },
    {
      year: 2015,
      title: "애플 워치(Apple Watch) 출시",
      description: "",
      details: "웨어러블 디바이스 시대"
    },
    {
      year: 2017,
      title: "가변 폰트(Variable Fonts) 기술 표준화",
      description: "",
      details: "하나의 폰트 파일로 다양한 스타일 구현"
    },
    {
      year: 2018,
      title: "피그마(Figma) 대중화",
      description: "",
      details: "협업 중심의 디자인 도구"
    },
    {
      year: 2019,
      title: "다크 모드(Dark Mode) 확산",
      description: "",
      details: "운영체제 및 앱에 다크 모드 적용"
    },
    {
      year: 2020,
      title: "원격 협업 도구 급성장",
      description: "",
      details: "팬데믹으로 인한 디지털 전환 가속화"
    },
    {
      year: 2021,
      title: "NFT 아트 시장 급성장",
      description: "",
      details: "디지털 아트의 새로운 가치 창출"
    },
    {
      year: 2022,
      title: "AI 이미지 생성 도구 등장",
      description: "",
      details: "Midjourney, DALL-E, Stable Diffusion 등"
    },
    {
      year: 2024,
      title: "생성형 AI 디자인 도구 발전",
      description: "",
      details: "AI를 활용한 디자인 자동화 확산"
    }
  ];

  const filteredData = timelineData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.year.toString().includes(searchTerm)
  );

  return (
    <div className={`py-8`}>
      <div className="max-w-4xl mx-auto">
        {/* <div className="mb-8 text-center">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full max-w-md px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode 
                ? 'bg-gray-900 border-gray-700 text-white focus:ring-gray-600' 
                : 'bg-white border-gray-300 text-gray-800 focus:ring-gray-400'
            }`}
          />
        </div> */}

        <div className="relative">
          <div className={`absolute left-8 top-0 bottom-0 w-0.5`}></div>
          
          {filteredData.map((item, index) => (
            <div key={index} className="mb-8 flex">
              <div className="flex-shrink-0 w-16 text-right pr-4">
                <p className={`본문폰트 font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {item.year}
                </p>
              </div>
              
              <div className="relative flex-grow pl-8">
                <h3 className={`본문폰트 font-bold mb-2`}>
                  {item.title}
                </h3>
                {/* {item.description && (
                  <p className={`본문폰트 mb-2 font-semibold`}>
                      {item.description}
                    </p>
                  )} */}
                  {item.details && (
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;