import React, { useState, useRef, useEffect } from 'react';
import { Message, NavItem } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage } from './ChatMessage';
import { Send, Sparkles, PlusCircle, Image as ImageIcon } from 'lucide-react';

interface ChatInterfaceProps {
  activeContext: NavItem;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ activeContext }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track if we've already triggered the Agent follow-up to avoid duplicates
  const [agentFollowUpTriggered, setAgentFollowUpTriggered] = useState(false);

  // Initial greeting based on context
  useEffect(() => {
    // Reset state when switching context
    setAgentFollowUpTriggered(false);

    if (activeContext === NavItem.ASSETS) {
      setMessages([
        {
          id: 'welcome-assets',
          role: 'model',
          text: '我是您的素材生成助手。为了更精准地为您的商品生成全链路素材（视频、文案、直播话术），我需要先整合店铺数据。\n\n请您完成以下基础信息同步：',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'data-binding'
        }
      ]);
    } else if (activeContext === NavItem.PRODUCTS) {
      setMessages([
        {
          id: 'welcome-products',
          role: 'model',
          text: '收到需求啦😊 您可先上传美团商品截图快速搬品，或直接描述需求～',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'upload-trigger',
          widgetData: {
            label: '上传美团截图',
            sub: '支持商品详情页截图',
            actionType: 'upload_meituan'
          }
        }
      ]);
    } else if (activeContext === NavItem.MARKETING) {
      setMessages([
        {
          id: 'welcome-marketing',
          role: 'model',
          text: '好的，老李！很高兴能帮您。我是您的AI营销管家。\n\n听说您这周新推出了一个“手冲咖啡体验券”活动，能详细说说吗？我们一起来制定推广计划！',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'simple-options',
          widgetData: {
             actionKey: 'marketing_start',
             options: [
               { label: '开始“手冲咖啡”推广Demo', value: 'start_demo', primary: true }
             ]
          }
        }
      ]);
    } else if (activeContext === NavItem.DIAGNOSIS) {
      setMessages([
        {
          id: 'welcome-diagnosis',
          role: 'model',
          text: '早上好，李老板！您的AI助手已完成昨日经营巡检，发现一个**高优待办**，请及时处理：',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'diagnosis-alert'
        }
      ]);
    } else if (activeContext === NavItem.AGENT) {
      // New Agent with Smart Report
      setMessages([
        {
          id: 'welcome-agent',
          role: 'model',
          text: '', // Text is inside the widget mostly, or we can add a brief greeting above
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'smart-report'
        }
      ]);
    } else {
      setMessages([
        {
          id: 'welcome-default',
          role: 'model',
          text: '您好！我是您的抖音来客智能经营顾问。我可以为您分析店铺数据、生成营销素材或提供推广建议。请问今天需要什么帮助？',
          timestamp: new Date()
        }
      ]);
    }
  }, [activeContext]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Demo Scenario Flow Handler
  const handleWidgetAction = (actionType: string, payload: any) => {
    // === SCENARIO 0: Agent (Smart Report) ===
    if (activeContext === NavItem.AGENT) {
      handleAgentScenario(actionType, payload);
    }
    // === SCENARIO 1: Assets (Material Generation) ===
    else if (activeContext === NavItem.ASSETS) {
      handleAssetsScenario(actionType, payload);
    } 
    // === SCENARIO 2: Products (Product Management) ===
    else if (activeContext === NavItem.PRODUCTS) {
      handleProductScenario(actionType, payload);
    }
    // === SCENARIO 3: Marketing (Promotion) ===
    else if (activeContext === NavItem.MARKETING) {
      handleMarketingScenario(actionType, payload);
    }
    // === SCENARIO 4: Diagnosis (Business Diagnosis) ===
    else if (activeContext === NavItem.DIAGNOSIS) {
      handleDiagnosisScenario(actionType, payload);
    }
  };
  
  // --- Scenario Logic for AGENT (Smart Report) ---
  const handleAgentScenario = (actionType: string, payload: any) => {
    if (actionType === 'report_expanded' && !agentFollowUpTriggered) {
      setAgentFollowUpTriggered(true);
      setTimeout(() => {
        addBotMessage({
          id: 'agent-followup',
          role: 'model',
          text: '李老板，看到您的复购率是短板，且跨年季是巨大机会。对于下个月的经营，有什么新目标吗？',
          timestamp: new Date()
        });
      }, 800);
    }
  };

  // --- Scenario Logic for DIAGNOSIS ---
  const handleDiagnosisScenario = (actionType: string, payload: any) => {
    // 1. User asks "Why?"
    if (actionType === 'diagnosis_analyze') {
      handleSendUserAction('成本怎么突然高了这么多？什么原因？');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'diagnosis-detail',
          role: 'model',
          text: '正在分析... AI定位到主要原因是：\n\n1. **素材衰退**：视频素材「热闹排队氛围」已投放15天，点击率下降20%，用户可能已产生审美疲劳。\n2. **出价不合理**：在“23:00-凌晨2:00”的夜宵时段，流量竞争少，但您的出价仍维持高峰期水平，导致成本浪费。\n\n我为您生成了智能诊断与优化方案：',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'diagnosis-card',
          widgetData: {
            items: [
              {
                id: 'fix_material',
                icon: 'video',
                title: '问题1：素材衰退',
                problem: '视频「热闹排队氛围」已进入衰退期。',
                suggestion: '替换为高潜力视频「新品和牛展示」（AI评分A级，互动率高50%）。',
                preview: '预览新素材视频.mp4',
                actionLabel: '一键替换并暂停旧素材'
              },
              {
                id: 'fix_bid',
                icon: 'dollar',
                title: '问题2：出价不合理',
                problem: '夜宵时段出价过高，存在优化空间。',
                suggestion: '启用“分时段出价”，将“23:00-凌晨2:00”时段出价下调20%。',
                actionLabel: '采纳分时出价建议'
              },
              {
                id: 'fix_highlight',
                icon: 'bulb',
                title: '附：新发现的口碑亮点！',
                problem: '15条好评提及“自助冰淇淋很好吃”。',
                suggestion: '将“不限量供应哈根达斯风味冰淇淋”加入商品详情页，提升转化。',
                actionLabel: '一键添加至详情页'
              }
            ]
          }
        });
      }, 1500);
    }

    // 2. All Actions Taken
    if (actionType === 'diagnosis_all_applied') {
      // Simulate slight delay for the last click to register visually
      setTimeout(() => {
        addBotMessage({
          id: 'diagnosis-success',
          role: 'model',
          text: '👍 全部采纳成功！\n\n- 广告计划已更新素材。\n- 分时出价策略已生效。\n- 商品详情页已补充新卖点。\n\nAI将持续监控优化效果，并在下周的经营周报中向您重点分析。祝您今天生意兴隆！',
          timestamp: new Date()
        });
      }, 800);
    }
  };

  // --- Scenario Logic for MARKETING (Existing) ---
  const handleMarketingScenario = (actionType: string, payload: any) => {
    // 1. Start Demo
    if (actionType === 'marketing_start') {
      handleSendUserAction('AI管家，我又来找你了！我这周新推出了一个“手冲咖啡体验券”的活动，原价78块的体验，现在只要39块9。我想让更多我们店附近的新客人知道这个活动，周末能多来我们店里喝杯咖啡就好了。');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'budget-ask',
          role: 'model',
          text: '好的，老李！“手冲咖啡体验券”听起来很棒，价格也很有吸引力。为了更好地为您制定推广计划，我需要先了解几个小问题：\n\n您大概想花多少钱做这次推广呢？比如，您对这次活动的总预算大概是多少？',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'simple-options',
          widgetData: {
             actionKey: 'budget_answer',
             options: [
               { label: '预算2000元', value: '2000', primary: true },
               { label: '预算5000元', value: '5000' }
             ]
          }
        });
      }, 1500);
    }

    // 2. Budget Answer
    if (actionType === 'budget_answer') {
      handleSendUserAction('预算啊……嗯，我是想先投入2000块钱，看看效果怎么样。如果效果好，下次我可以再加钱。');
      setTimeout(() => {
         addBotMessage({
           id: 'duration-ask',
           role: 'model',
           text: '好的，2000元的预算我记下了。那么，您希望这次推广大概持续多久呢？比如两周，还是一个月？',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'duration_answer',
             options: [
               { label: '2-3周', value: '2-3weeks', primary: true },
               { label: '1个月', value: '1month' }
             ]
           }
         });
      }, 1000);
    }

    // 3. Duration Answer -> Target Audience Ask
    if (actionType === 'duration_answer') {
      handleSendUserAction('两到三周吧，我希望能尽快看到效果，也想赶在咖啡的新鲜度最好的时候推广。');
      setTimeout(() => {
        addBotMessage({
          id: 'target-ask',
          role: 'model',
          text: '明白。最后，也是最关键的问题：您希望吸引什么样的新客人到店呢？\n\n比如，是年轻人还是中年人？是附近的上班族朋友多一些，还是住家居民多一些？对咖啡有什么偏好之类的？',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'simple-options',
          widgetData: {
             actionKey: 'target_answer',
             options: [
               { label: '25-40岁白领/居民', value: 'white_collar', primary: true },
               { label: '大学生/年轻人', value: 'students' }
             ]
           }
        });
      }, 1000);
    }

    // 4. Target Answer -> Plan Proposal
    if (actionType === 'target_answer') {
      handleSendUserAction('嗯，我的咖啡比较讲究品质。目标客人应该是那种25到40岁、喜欢尝试新东西、注重生活品质的白领和居民吧，他们大部分人工作在附近，或者就住在我们店周边。');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'plan-proposal',
          role: 'model',
          text: '谢谢老李！根据您提供的信息，我为您准备了一套详细的“新客引流增益”方案。方案包含了达人推荐、营销工具配置和周边广告投放，预计能帮您在两三周内带来至少50-80位新客的到店体验。您听听看：',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'marketing-plan'
        });
      }, 2500);
    }

    // 5. Confirm Plan -> Simulation Start (1 Week Later)
    if (actionType === 'confirm_marketing_plan') {
      handleSendUserAction('嗯……方案听起来很专业，也挺全面的！有两个达人推荐，这点很好。那就按这个执行吧！');
      
      setTimeout(() => {
        addBotMessage({
          id: 'sim-1week',
          role: 'model',
          text: '⏳ (系统模拟：时间已过去一周...)',
          timestamp: new Date()
        });
        
        setTimeout(() => {
          addBotMessage({
            id: 'optimize-report',
            role: 'model',
            text: '老李您好！我是AI管家。我监测到您的“手冲咖啡体验券”推广活动，目前上线一周，数据表现非常积极（已核销新客65位！），但也发现了一些可以优化的点。\n\n抖音效果很好，但微信朋友圈的成本偏高（CPA ¥35）。建议您：',
            timestamp: new Date(),
            type: 'widget',
            widgetType: 'optimization-decision'
          });
        }, 1000);
      }, 1500);
    }

    // 6. Optimization Decision -> Final Report (2.5 Weeks Later)
    if (actionType === 'optimize_marketing') {
      if (payload === 'stop_wechat') {
        handleSendUserAction('哇！才一周就65个新客了，这效率太高了！嗯，微信朋友圈的效果确实不太理想。既然抖音效果那么好，那就把朋友圈那地方的钱都加到抖音去吧，集中火力！');
      } else {
        handleSendUserAction('我觉得可以再试一下，帮我换个更吸引人的朋友圈素材吧。');
      }
      
      setTimeout(() => {
         addBotMessage({
           id: 'opt-confirm',
           role: 'model',
           text: '好的老李！您的指令已收到。我已为您暂停了微信朋友圈广告，并将剩余预算全部追加到抖音本地生活广告中。',
           timestamp: new Date()
         });

         setTimeout(() => {
            addBotMessage({
              id: 'sim-final',
              role: 'model',
              text: '⏳ (系统模拟：活动结束，两周半后...)',
              timestamp: new Date()
            });

            setTimeout(() => {
               addBotMessage({
                 id: 'final-report',
                 role: 'model',
                 text: '老李您好！“手冲咖啡体验券”推广活动已圆满结束，效果远超预期！🎉\n\n总计带来新客 165 位 (预期50-80位)，平均获客成本仅 ¥12.1。以下是完整报告：',
                 timestamp: new Date(),
                 type: 'widget',
                 widgetType: 'campaign-report'
               });
            }, 1000);
         }, 2000);
      }, 1000);
    }

    // 7. Finish
    if (actionType === 'finish_report') {
      handleSendUserAction('太棒了，这效果没得说！下次有新活动还找你！');
      setTimeout(() => {
        addBotMessage({
          id: 'bye',
          role: 'model',
          text: '谢谢老李的认可！您可以随时在“经营诊断”里查看留存数据，我们也准备好了针对这批新客的复购方案，随时恭候您的召唤！',
          timestamp: new Date()
        });
      }, 1000);
    }
  };

  // --- Scenario Logic for PRODUCTS (Existing) ---
  const handleProductScenario = (actionType: string, payload: any) => {
    // 1. Upload Meituan Screenshot
    if (actionType === 'upload_meituan') {
      handleSendUserAction('[用户上传了美团“经典3人火锅套餐”截图]');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'meituan-analysis',
          role: 'model',
          text: '正在识别美团信息→商品名称：经典 3 人火锅套餐，价格：168 元，组合：毛肚 1 份 + 肥牛 1 份 + 蔬菜拼盘 1 份。\n\n需自动匹配抖音来客“火锅”类目 +“团购品”模板吗？',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'simple-options',
          widgetData: {
            actionKey: 'confirm_match',
            options: [
              { label: '确认匹配', value: 'confirm', primary: true },
              { label: '修改类目/模板', value: 'modify' }
            ]
          }
        });
      }, 1500);
    }

    // 2. Confirm Match & Upload Menu
    if (actionType === 'confirm_match') {
      if (payload === 'confirm') {
        handleSendUserAction('确认匹配～另外我还有张线下菜单，想把新品类的菜加进去。');
        setTimeout(() => {
           addBotMessage({
             id: 'menu-upload-req',
             role: 'model',
             text: '没问题～【上传菜单图片】按钮已就绪，您可直接上传，我帮您拆解菜品信息～',
             timestamp: new Date(),
             type: 'widget',
             widgetType: 'upload-trigger',
             widgetData: {
               label: '上传菜单图片',
               sub: '支持拍照或图片文件',
               actionType: 'upload_menu'
             }
           });
        }, 1000);
      }
    }

    // 3. Upload Menu
    if (actionType === 'upload_menu') {
       handleSendUserAction('[用户上传了菜单图片]');
       setIsLoading(true);
       setTimeout(() => {
         setIsLoading(false);
         addBotMessage({
           id: 'menu-analysis',
           role: 'model',
           text: '菜单识别完成→鲜切吊龙（58 元 / 大份）、响铃卷（12 元 / 份）。需将这些菜品加入新套餐的子商品吗？',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'add_to_set_decision',
             options: [
               { label: '添加至新套餐', value: 'add', primary: true },
               { label: '单独创建商品', value: 'separate' }
             ]
           }
         });
       }, 1500);
    }

    // 4. Decision: Add to Set
    if (actionType === 'add_to_set_decision' && payload === 'add') {
      handleSendUserAction('添加到新套餐里，我想做个 3 人套餐，包含毛肚、肥牛、鲜切吊龙、响铃卷、蔬菜拼盘～');
      setTimeout(() => {
        addBotMessage({
           id: 'naming-proposal',
           role: 'model',
           text: '明白～已拆解需求：3 人火锅套餐，子商品：毛肚 1 + 肥牛 1 + 鲜切吊龙 1 + 响铃卷 1 + 蔬菜拼盘 1。\n\n为您生成商品名称候选：',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'copy-selection',
           widgetData: {
             options: [
               { id: 'copy', tag: '热卖复刻', content: '经典 3 人火锅套餐（同步美团款）' },
               { id: 'diff', tag: '差异化升级', content: '鲜切吊龙版 3 人火锅套餐（含新品类）' }
             ]
           }
        });
      }, 1500);
    }

    // 5. Select Name -> Smart Decision
    if (actionType === 'select_copy' && payload === 'diff') {
      handleSendUserAction('想要差异化的，结合秋冬滋补的热点～');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
           id: 'smart-decision-form',
           role: 'model',
           text: '好的～为您生成差异化名称：【秋冬滋补】鲜切吊龙 + 毛肚肥牛 3 人火锅套餐。\n\n根据您门店近 30 天 GMV（20 万）、库存（毛肚备货充足）、客单价（180 元），推荐信息如下，请确认：',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'product-form',
           widgetData: {
             defaultType: '团购品',
             defaultPrice: 198,
             defaultComposition: '毛肚 1 + 肥牛 1 + 鲜切吊龙 1 + 响铃卷 1 + 蔬菜拼盘 1'
           }
        });
      }, 2000);
    }

    // 6. Confirm Form -> Style Selection
    if (actionType === 'confirm_product_config') {
      handleSendUserAction(`价格改成 ${payload.price}，商品类型选${payload.productType}，组合不变～`);
      setTimeout(() => {
         addBotMessage({
           id: 'style-selection-product',
           role: 'model',
           text: `已更新价格为 ${payload.price} 元，商品类型：${payload.productType}✅\n\n现在为您生成头图～您喜欢哪种风格？`,
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'style-selection',
           widgetData: {
             styles: [
               { id: 'guochao', name: '国潮风', desc: '火锅场景 + 菜品特写，带“秋冬滋补”字样', color: 'bg-red-50 text-red-600' },
               { id: 'simple', name: '简约风', desc: '白底 + 菜品摆盘，突出价格', color: 'bg-gray-50 text-gray-600' },
               { id: '3d', name: '动态 3D', desc: '360° 旋转展示菜品', color: 'bg-blue-50 text-blue-600' },
             ]
           }
         });
      }, 1000);
    }

    // 7. Select Style -> Copy Generation
    if (actionType === 'select_style' && activeContext === NavItem.PRODUCTS) {
      handleSendUserAction(`选${payload}～`);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
           id: 'copy-verify',
           role: 'model',
           text: `头图生成中→【${payload} 3 人火锅套餐头图】已完成～\n\n文案部分，结合用户评价高频需求“上菜快”，为您生成卖点：“30 分钟上齐菜，鲜切吊龙 + 毛肚肥牛，秋冬滋补必囤🔥”。\n\n需要调整文案风格或卖点吗？`,
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'verify_copy',
             options: [
               { label: '确认文案', value: 'confirm', primary: true },
               { label: '更换卖点方向', value: 'change' }
             ]
           }
        });
      }, 2000);
    }

    // 8. Confirm Copy -> Hosting
    if (actionType === 'verify_copy') {
      handleSendUserAction('确认文案，卖点挺好的～');
      setTimeout(() => {
         addBotMessage({
           id: 'hosting-offer',
           role: 'model',
           text: '商品配置已全部完成✅ 您可选择：\n\n① 立即发布（审核后上架）\n② 加入商品托管（我会监控货架套餐数，若＜4 个，自动基于近 7 天热销品生成新商品，您可选择“审核后发布”或“全托管”~）',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'hosting_decision',
             options: [
               { label: '立即发布', value: 'publish' },
               { label: '发布并开启托管', value: 'publish_hosting', primary: true }
             ]
           }
         });
      }, 1000);
    }

    // 9. Enable Hosting -> Single Items Extension
    if (actionType === 'hosting_decision' && payload === 'publish_hosting') {
       handleSendUserAction('先发布这个套餐，托管功能也开启吧～');
       setTimeout(() => {
         addBotMessage({
           id: 'single-items-offer',
           role: 'model',
           text: '已帮您发布“【秋冬滋补】鲜切吊龙 + 毛肚肥牛 3 人火锅套餐”，托管功能已开启～\n\n您上传的菜单已识别出“鲜切吊龙、响铃卷”，是否需要将它们单独创建为“单点菜品”？',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'create_singles',
             options: [
               { label: '是，单独创建', value: 'yes', primary: true },
               { label: '否', value: 'no' }
             ]
           }
         });
       }, 1500);
    }

    // 10. Create Singles -> Final
    if (actionType === 'create_singles' && payload === 'yes') {
      handleSendUserAction('是，单独创建～');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
           id: 'final-singles-confirm',
           role: 'model',
           text: '正在生成单点菜品信息→鲜切吊龙（58 元 / 大份）、响铃卷（12 元 / 份），头图已自动匹配“火锅菜品特写”风格。需要确认发布吗？',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'simple-options',
           widgetData: {
             actionKey: 'finish_process',
             options: [
               { label: '确认发布', value: 'confirm', primary: true },
               { label: '修改价格/图片', value: 'modify' }
             ]
           }
        });
      }, 2000);
    }

    if (actionType === 'finish_process') {
      handleSendUserAction('确认发布～');
      setTimeout(() => {
        addBotMessage({
          id: 'done',
          role: 'model',
          text: '所有操作已完成✅ 您的 3 人套餐和 2 个单点菜品已上架～\n\n后续我会自动监控货架，若套餐数＜4 个，会基于近 7 天热销品生成新商品并提醒您审核哦～',
          timestamp: new Date()
        });
      }, 1000);
    }
  };

  // --- Scenario Logic for ASSETS (Existing) ---
  const handleAssetsScenario = (actionType: string, payload: any) => {
    // 1. Handle Binding
    if (actionType === 'bind_douyin' || actionType === 'bind_meituan') {
      setMessages(prev => prev); // Force update logic handled in component usually, simplifying here
      setTimeout(() => {
         if (!messages.find(m => m.id === 'data-summary')) {
           handleSendUserAction('已完成数据绑定');
           setTimeout(() => {
             addBotMessage({
               id: 'data-summary',
               role: 'model',
               text: '数据整合完成✅ 素材库基础信息：\n\n- 商品：月兔流心蛋糕（39.9 元 / 个，6 寸，流心奶黄 + 玉兔造型）\n- 核心卖点：中秋限定、流心爆浆、玉兔造型\n- 历史爆款逻辑：抖音 1.2w 播放视频（突出‘流心爆浆’特写）、美团评价‘氛围感拉满’\n\n现在为您生成全链路素材，请选择需要生成的类型：',
               timestamp: new Date(),
               type: 'widget',
               widgetType: 'material-selection'
             });
           }, 1000);
         }
      }, 500);
    }

    // 2. Handle Material Selection
    if (actionType === 'confirm_materials') {
      const selectedCount = payload.length;
      handleSendUserAction(`我选择了 ${selectedCount} 种素材类型，开始生成吧！`);
      
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'copy-generation',
          role: 'model',
          text: '收到～先处理文案。已结合行业热词“中秋限定” + 商品卖点，生成以下多场景文案候选。请选择您喜欢的方向：',
          timestamp: new Date(),
          type: 'widget',
          widgetType: 'copy-selection',
          widgetData: {
            options: [
              { id: 1, tag: '大众化', content: '月兔流心蛋糕 39.9！中秋氛围感拉满（参考历史爆款）' },
              { id: 2, tag: '家庭用户', content: '亲子 DIY！月兔流心蛋糕，中秋陪娃做甜点' },
              { id: 3, tag: '年轻用户', content: '网红打卡！爆浆月兔蛋糕，朋友圈 C 位预定' }
            ]
          }
        });
      }, 1500);
    }

    // 3. Handle Copy Selection
    if (actionType === 'select_copy' && activeContext === NavItem.ASSETS) {
      handleSendUserAction('我选这个文案方向，结合评价里的“流心爆浆”！');
      setTimeout(() => {
         addBotMessage({
           id: 'image-upload-req',
           role: 'model',
           text: '明白！文案已锁定。\n\n接下来处理图片素材。请上传您的蛋糕实拍图，我将为您美化并生成不同风格的营销头图。',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'image-upload',
           widgetData: { label: '点击上传产品原图' }
         });
      }, 1000);
    }

    // 4. Handle Image Upload
    if (actionType === 'upload_image') {
      handleSendUserAction('[用户上传了一张蛋糕切面图片]');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
           id: 'style-selection',
           role: 'model',
           text: '图片识别完成～为您生成 3 版风格化头图，请选择：',
           timestamp: new Date(),
           type: 'widget',
           widgetType: 'style-selection',
           widgetData: {
             styles: [
               { id: 'guochao', name: '国潮风', desc: '中秋灯笼背景 + 强节日氛围', color: 'bg-red-50 text-red-600' },
               { id: 'anime', name: '二次元风', desc: 'Q版月兔 + 爆浆预警文字', color: 'bg-purple-50 text-purple-600' },
               { id: 'real', name: '实景风', desc: '高清切面 + 突出食欲感', color: 'bg-orange-50 text-orange-600' },
             ]
           }
        });
      }, 2000);
    }

    // 5. Handle Style Selection
    if (actionType === 'select_style' && activeContext === NavItem.ASSETS) {
      handleSendUserAction(`选${payload}，再加个“热销 TOP1”标签！`);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        addBotMessage({
          id: 'final-result',
          role: 'model',
          text: `✅ 已生成${payload}头图\n✅ 自动叠加“热销 TOP1”标签（弱样式，适配独立卡）\n✅ 硬广卡已配置“限时 5 折”闪烁标签\n\n全套素材已打包发送至您的【素材中心】，可直接一键投放！`,
          timestamp: new Date()
        });
      }, 1500);
    }
  }

  const handleSendUserAction = (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
  };

  const addBotMessage = (msg: any) => {
    setMessages(prev => [...prev, msg]);
  };

  // Normal Chat Handler
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, text: m.text }));
    
    const botMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: botMsgId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: new Date()
    }]);

    let fullResponse = '';

    await streamChatResponse(history, input, (chunk) => {
      fullResponse += chunk;
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: fullResponse } 
          : msg
      ));
    });

    setMessages(prev => prev.map(msg => 
      msg.id === botMsgId 
        ? { ...msg, isStreaming: false } 
        : msg
    ));
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "如何提升店铺动销率？",
    "帮我写一段火锅套餐的推广文案",
    "最近流量下降了，帮我诊断一下原因",
    "生成一个短视频拍摄脚本"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <ChatMessage 
              key={msg.id} 
              message={msg} 
              onWidgetAction={handleWidgetAction}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Suggestions - Only show in Agent mode and if few messages */}
          {activeContext === NavItem.AGENT && messages.length < 3 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors whitespace-nowrap border border-blue-100"
                >
                  <Sparkles size={12} />
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="relative bg-white border border-gray-300 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeContext === NavItem.ASSETS ? "在此输入您的素材需求，或按上方指引操作..." : activeContext === NavItem.PRODUCTS ? "在此输入您的新品需求，或上传菜单..." : activeContext === NavItem.MARKETING ? "在此输入您的推广需求..." : activeContext === NavItem.DIAGNOSIS ? "在此输入您的疑问..." : "输入您的问题，例如：'如何提高团购转化率？'..."}
              className="w-full px-4 py-3 bg-transparent border-none rounded-xl focus:ring-0 resize-none h-[80px] text-gray-700 placeholder-gray-400 text-sm"
            />
            
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-2">
                 <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="上传图片">
                   <ImageIcon size={18} />
                 </button>
                 <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="更多工具">
                   <PlusCircle size={18} />
                 </button>
              </div>

              <button
                onClick={handleSend}
                disabled={(!input.trim() && !isLoading) || isLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all
                  ${(!input.trim() && !isLoading) || isLoading
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                  }`}
              >
                {isLoading ? '思考中...' : '发送'}
                {!isLoading && <Send size={14} />}
              </button>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-3">
            Agent生成内容仅供参考，请以实际经营数据为准。
          </p>
        </div>
      </div>
    </div>
  );
};