import React, { useState } from 'react';
import { Message } from '../types';
import { Bot, User, Link, Check, UploadCloud, Image as ImageIcon, CheckCircle2, PlayCircle, FileText, Monitor, LayoutTemplate, Layers, Wand2, Calculator, PackageCheck, ListPlus, TrendingUp, TrendingDown, Users, DollarSign, Target, BarChart3, PieChart, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onWidgetAction?: (actionType: string, payload: any) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onWidgetAction }) => {
  const isModel = message.role === 'model';
  const [localData, setLocalData] = useState<any>({
    productType: message.widgetData?.defaultType || 'group',
    price: message.widgetData?.defaultPrice || 198,
    composition: message.widgetData?.defaultComposition || '',
  });
  
  // Track accepted diagnosis items locally to show UI state changes immediately
  const [acceptedDiagnosisItems, setAcceptedDiagnosisItems] = useState<string[]>([]);

  const handleCheckboxChange = (value: string) => {
    setLocalData((prev: any) => {
      const current = prev.selected || [];
      const updated = current.includes(value) 
        ? current.filter((i: string) => i !== value)
        : [...current, value];
      return { ...prev, selected: updated };
    });
  };

  const handleDiagnosisAction = (id: string) => {
    if (acceptedDiagnosisItems.includes(id)) return;
    
    const newAccepted = [...acceptedDiagnosisItems, id];
    setAcceptedDiagnosisItems(newAccepted);
    
    // Notify parent
    if (message.widgetData?.items && newAccepted.length === message.widgetData.items.length) {
      onWidgetAction?.('diagnosis_all_applied', true);
    } else {
      onWidgetAction?.('diagnosis_item_applied', id);
    }
  };

  const renderWidget = () => {
    if (!message.widgetType) return null;

    switch (message.widgetType) {
      case 'data-binding':
        return (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            <button 
              onClick={() => onWidgetAction?.('bind_douyin', true)}
              disabled={localData.douyinBound}
              className={`flex items-center p-3 border rounded-xl transition-all text-left group
                ${localData.douyinBound ? 'bg-green-50 border-green-200 cursor-default' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'}`}
            >
              <div className={`p-2 rounded-lg mr-3 ${localData.douyinBound ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                {localData.douyinBound ? <Check size={20} /> : <Monitor size={20} />}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{localData.douyinBound ? '抖音号已绑定' : '绑定抖音号'}</div>
                <div className="text-xs text-gray-500">{localData.douyinBound ? '已同步3条热门视频' : '同步历史视频数据'}</div>
              </div>
            </button>

            <button 
              onClick={() => onWidgetAction?.('bind_meituan', true)}
              disabled={localData.meituanBound}
              className={`flex items-center p-3 border rounded-xl transition-all text-left group
                ${localData.meituanBound ? 'bg-green-50 border-green-200 cursor-default' : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm'}`}
            >
              <div className={`p-2 rounded-lg mr-3 ${localData.meituanBound ? 'bg-green-100 text-green-600' : 'bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100'}`}>
                {localData.meituanBound ? <Check size={20} /> : <Link size={20} />}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{localData.meituanBound ? '链接已解析' : '美团商品链接'}</div>
                <div className="text-xs text-gray-500">{localData.meituanBound ? '提取评价: 氛...' : '提取评价关键词'}</div>
              </div>
            </button>
          </div>
        );

      case 'material-selection':
        const options = [
          { id: 'copy', label: '文案', icon: FileText, sub: '标题/口播' },
          { id: 'image', label: '图片', icon: ImageIcon, sub: '主图/场景图' },
          { id: 'video', label: '视频', icon: PlayCircle, sub: '混剪/口播' },
          { id: 'live', label: '直播', icon: Monitor, sub: '背景/话术' },
          { id: 'card', label: '卡片', icon: LayoutTemplate, sub: '广告/独立卡' },
          { id: 'landing', label: '落地页', icon: Layers, sub: 'H5/小程序' },
        ];
        return (
          <div className="mt-3 w-full max-w-lg">
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
               {options.map((opt) => {
                 const isSelected = (localData.selected || []).includes(opt.id);
                 return (
                   <div 
                    key={opt.id}
                    onClick={() => handleCheckboxChange(opt.id)}
                    className={`cursor-pointer p-3 border rounded-xl flex flex-col items-center justify-center text-center transition-all
                      ${isSelected ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
                   >
                     <opt.icon size={20} className={`mb-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                     <div className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>{opt.label}</div>
                     <div className="text-[10px] text-gray-400">{opt.sub}</div>
                   </div>
                 )
               })}
             </div>
             <button 
               onClick={() => onWidgetAction?.('confirm_materials', localData.selected)}
               disabled={!localData.selected?.length}
               className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
             >
               开始生成 ({localData.selected?.length || 0})
             </button>
          </div>
        );

      case 'copy-selection':
        return (
          <div className="mt-3 space-y-2 w-full max-w-lg">
            {(message.widgetData?.options || []).map((opt: any, idx: number) => (
              <div key={idx} className="group relative p-3 bg-white border border-gray-200 hover:border-blue-400 rounded-xl transition-all cursor-pointer"
                   onClick={() => onWidgetAction?.('select_copy', opt.id)}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 mb-1">{opt.tag}</span>
                    <p className="text-sm text-gray-800 font-medium">{opt.content}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-blue-600">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'upload-trigger': // Reusable generic upload
      case 'image-upload': // Legacy support for material flow
        const label = message.widgetData?.label || '点击上传图片';
        const sub = message.widgetData?.sub || '支持 JPG, PNG (最大 5MB)';
        return (
          <div className="mt-3 w-full max-w-sm">
            <div 
              onClick={() => onWidgetAction?.(message.widgetData?.actionType || 'upload_image', true)}
              className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <UploadCloud size={32} className="text-blue-500 mb-2" />
              <span className="text-sm font-medium text-blue-700">{label}</span>
              <span className="text-xs text-blue-400 mt-1">{sub}</span>
            </div>
          </div>
        );

      case 'style-selection':
        const styles = message.widgetData?.styles || [
          { id: 'guochao', name: '国潮风', desc: '中秋灯笼背景 + 强节日氛围', color: 'bg-red-50 text-red-600' },
          { id: 'anime', name: '二次元风', desc: 'Q版月兔 + 爆浆预警文字', color: 'bg-purple-50 text-purple-600' },
          { id: 'real', name: '实景风', desc: '高清切面 + 突出食欲感', color: 'bg-orange-50 text-orange-600' },
        ];
        return (
          <div className="mt-3 w-full max-w-xl">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {styles.map((style: any) => (
                 <div 
                  key={style.id}
                  onClick={() => onWidgetAction?.('select_style', style.name)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-blue-400 cursor-pointer transition-all"
                 >
                   <div className={`h-24 ${style.color || 'bg-gray-100 text-gray-500'} flex items-center justify-center`}>
                      <Wand2 size={24} />
                   </div>
                   <div className="p-3">
                     <div className="text-sm font-bold text-gray-900">{style.name}</div>
                     <div className="text-xs text-gray-500 mt-1 leading-tight">{style.desc}</div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        );

      case 'simple-options':
        return (
           <div className="mt-3 flex flex-wrap gap-2 w-full max-w-lg">
             {(message.widgetData?.options || []).map((opt: any, idx: number) => (
               <button
                 key={idx}
                 onClick={() => onWidgetAction?.(message.widgetData.actionKey || 'option_selected', opt.value)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                   ${opt.primary 
                     ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                   }`}
               >
                 {opt.label}
               </button>
             ))}
           </div>
        );

      case 'product-form':
        return (
          <div className="mt-3 w-full max-w-md bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
             <div className="space-y-4">
               {/* Product Type */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">商品类型</label>
                 <div className="flex flex-wrap gap-2">
                   {['团购品', '线索品', '次卡', '代金券'].map(type => (
                     <button
                       key={type}
                       onClick={() => setLocalData({...localData, productType: type})}
                       className={`px-3 py-1.5 text-xs rounded-md border transition-all
                         ${localData.productType === type 
                           ? 'bg-blue-50 border-blue-500 text-blue-700' 
                           : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                     >
                       {type}
                     </button>
                   ))}
                 </div>
               </div>

               {/* Price */}
               <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">推荐价格 (元)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-sm">¥</span>
                    <input 
                      type="number" 
                      value={localData.price}
                      onChange={(e) => setLocalData({...localData, price: e.target.value})}
                      className="w-full pl-7 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
               </div>

               {/* Composition */}
               <div>
                 <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">子商品组合</label>
                 <div className="relative">
                   <textarea
                     value={localData.composition}
                     onChange={(e) => setLocalData({...localData, composition: e.target.value})}
                     className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-20 resize-none bg-gray-50"
                   />
                 </div>
               </div>
               
               <button 
                 onClick={() => onWidgetAction?.('confirm_product_config', localData)}
                 className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
               >
                 <PackageCheck size={16} />
                 确认配置
               </button>
             </div>
          </div>
        );

      case 'marketing-plan':
        return (
          <div className="mt-3 w-full max-w-lg bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
             <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
               <span className="font-semibold text-blue-800 text-sm">☕️ 手冲咖啡体验券 · 推广方案</span>
               <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">预算 ¥2000</span>
             </div>
             <div className="p-4 space-y-4">
               <div className="flex gap-3 items-start">
                 <div className="mt-1 bg-purple-100 p-1.5 rounded-md text-purple-600"><Users size={16} /></div>
                 <div>
                   <h4 className="text-sm font-bold text-gray-800">达人推荐 (¥800)</h4>
                   <p className="text-xs text-gray-500 mt-1">
                     <span className="block">• @咖啡地图 (10w粉): 专业探店，精准垂直</span>
                     <span className="block">• @城市美好探店 (5w粉): 生活化，年轻受众</span>
                   </p>
                 </div>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 bg-orange-100 p-1.5 rounded-md text-orange-600"><Wand2 size={16} /></div>
                 <div>
                   <h4 className="text-sm font-bold text-gray-800">营销配置 (智能)</h4>
                   <p className="text-xs text-gray-500 mt-1">
                     <span className="block">• 首购特惠: 新客到店立减5元</span>
                     <span className="block">• 复购激励: 满50减10元 (有效期30天)</span>
                   </p>
                 </div>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 bg-green-100 p-1.5 rounded-md text-green-600"><Target size={16} /></div>
                 <div>
                   <h4 className="text-sm font-bold text-gray-800">精准投放 (¥1200)</h4>
                   <p className="text-xs text-gray-500 mt-1">
                     <span className="block">• 抖音本地 (¥1000): 3km内, 25-40岁, 兴趣:咖啡</span>
                     <span className="block">• 微信附近推 (¥200): 朋友圈曝光补充</span>
                   </p>
                 </div>
               </div>
             </div>
             <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button 
                  onClick={() => onWidgetAction?.('confirm_marketing_plan', true)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  确认方案并执行
                </button>
             </div>
          </div>
        );

      case 'optimization-decision':
        return (
          <div className="mt-3 w-full max-w-lg grid grid-cols-2 gap-3">
             <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
               <div className="flex items-center gap-2 mb-2">
                 <Monitor size={16} className="text-green-600" />
                 <span className="text-xs font-bold text-green-800">抖音本地生活</span>
               </div>
               <div>
                 <div className="text-2xl font-bold text-green-700">7%</div>
                 <div className="text-[10px] text-green-600">转化率 (高)</div>
                 <div className="text-[10px] text-green-600 mt-1">CPA: ¥12</div>
               </div>
               <div className="absolute -right-2 -bottom-2 opacity-10">
                 <TrendingUp size={64} />
               </div>
             </div>

             <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden">
               <div className="flex items-center gap-2 mb-2">
                 <ListPlus size={16} className="text-red-600" />
                 <span className="text-xs font-bold text-red-800">微信朋友圈</span>
               </div>
               <div>
                 <div className="text-2xl font-bold text-red-700">2%</div>
                 <div className="text-[10px] text-red-600">点击率 (低)</div>
                 <div className="text-[10px] text-red-600 mt-1">CPA: ¥35</div>
               </div>
                <div className="absolute -right-2 -bottom-2 opacity-10">
                 <TrendingDown size={64} />
               </div>
             </div>

             <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                <h4 className="text-xs font-bold text-gray-700 mb-2">建议优化操作：</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onWidgetAction?.('optimize_marketing', 'stop_wechat')}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                  >
                    A. 停朋友圈，加投抖音
                  </button>
                  <button 
                    onClick={() => onWidgetAction?.('optimize_marketing', 'change_creative')}
                    className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"
                  >
                    B. 更换朋友圈素材
                  </button>
                </div>
             </div>
          </div>
        );

      case 'campaign-report':
        return (
          <div className="mt-3 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
             <div className="bg-gray-900 text-white px-4 py-4 flex justify-between items-end">
               <div>
                 <div className="text-xs text-gray-400">推广总览</div>
                 <div className="text-xl font-bold">手冲咖啡体验券</div>
               </div>
               <div className="text-right">
                 <div className="text-xs text-gray-400">核销新客</div>
                 <div className="text-2xl font-bold text-green-400">165<span className="text-sm font-normal text-white">位</span></div>
               </div>
             </div>
             
             <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
               <div className="p-3 text-center">
                 <div className="text-[10px] text-gray-500">总花费</div>
                 <div className="text-sm font-bold text-gray-900">¥2000</div>
               </div>
               <div className="p-3 text-center">
                 <div className="text-[10px] text-gray-500">客单成本</div>
                 <div className="text-sm font-bold text-blue-600">¥12.1</div>
               </div>
               <div className="p-3 text-center">
                 <div className="text-[10px] text-gray-500">ROI</div>
                 <div className="text-sm font-bold text-green-600">1:3.5</div>
               </div>
             </div>

             <div className="p-4 space-y-3">
               <h4 className="text-xs font-bold text-gray-400 uppercase">成效亮点</h4>
               <div className="flex items-center gap-2 text-xs text-gray-700">
                 <CheckCircle2 size={14} className="text-blue-500" />
                 <span><b>达人推广</b> 贡献了 100 位新客 (Top1渠道)</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-700">
                 <CheckCircle2 size={14} className="text-blue-500" />
                 <span><b>复购券</b> 领取率达 80%，留存预期高</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-700">
                 <CheckCircle2 size={14} className="text-blue-500" />
                 <span><b>自动优化</b> 节省约 ¥300 无效投放</span>
               </div>
             </div>

             <div className="bg-gray-50 p-3">
               <button 
                className="w-full py-2 border border-gray-300 bg-white text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                onClick={() => onWidgetAction?.('finish_report', true)}
               >
                 查看详细数据报表
               </button>
             </div>
          </div>
        );
      
      case 'diagnosis-alert':
        return (
          <div className="mt-3 w-full max-w-lg bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 shadow-sm">
             <div className="flex-shrink-0 mt-0.5">
               <div className="p-2 bg-orange-100 text-orange-600 rounded-full">
                 <AlertTriangle size={20} />
               </div>
             </div>
             <div className="flex-1">
               <h4 className="text-sm font-bold text-orange-800">高优待办：广告预警</h4>
               <p className="text-xs text-gray-700 mt-1 leading-relaxed">
                 主推商品<span className="font-medium text-gray-900">「双人畅享火锅套餐」</span>的广告转化成本昨日上涨 <span className="text-red-600 font-bold">30%</span>，已超出预警线。
               </p>
               <button 
                 onClick={() => onWidgetAction?.('diagnosis_analyze', true)}
                 className="mt-3 text-xs bg-white border border-orange-200 text-orange-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-orange-100 transition-colors font-medium flex items-center gap-1"
               >
                 查看原因 & 优化 <ArrowRight size={12} />
               </button>
             </div>
          </div>
        );

      case 'diagnosis-card':
        const items = message.widgetData?.items || [];
        return (
          <div className="mt-3 w-full max-w-lg space-y-3">
            {items.map((item: any) => {
              const isAccepted = acceptedDiagnosisItems.includes(item.id);
              return (
                <div key={item.id} className={`bg-white border rounded-xl p-4 transition-all shadow-sm ${isAccepted ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                       {item.icon === 'video' ? <PlayCircle size={16} className={isAccepted ? "text-green-600" : "text-blue-500"} /> : 
                        item.icon === 'dollar' ? <DollarSign size={16} className={isAccepted ? "text-green-600" : "text-orange-500"} /> :
                        <Lightbulb size={16} className={isAccepted ? "text-green-600" : "text-purple-500"} />
                       }
                       <h4 className={`text-sm font-bold ${isAccepted ? 'text-green-800' : 'text-gray-800'}`}>{item.title}</h4>
                    </div>
                    {isAccepted && <CheckCircle2 size={16} className="text-green-600" />}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3 space-y-1">
                    <p><span className="text-gray-400">问题：</span>{item.problem}</p>
                    <p><span className="text-gray-400">建议：</span>{item.suggestion}</p>
                    {item.preview && (
                       <div className="mt-2 p-2 bg-gray-100 rounded text-[10px] text-gray-500 flex items-center gap-1">
                         <PlayCircle size={12} /> {item.preview}
                       </div>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDiagnosisAction(item.id)}
                    disabled={isAccepted}
                    className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors border
                      ${isAccepted 
                        ? 'bg-transparent border-transparent text-green-700 cursor-default' 
                        : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100 hover:border-blue-200'
                      }`}
                  >
                    {isAccepted ? '已执行 ✓' : item.actionLabel}
                  </button>
                </div>
              )
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] gap-4 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center 
          ${isModel ? 'bg-blue-100' : 'bg-gray-200'}`}>
          {isModel ? (
            <Bot size={20} className="text-blue-600" />
          ) : (
            <User size={20} className="text-gray-600" />
          )}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} w-full`}>
          {message.text && (
            <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap max-w-full
              ${isModel 
                ? 'bg-white text-gray-800 border border-gray-100' 
                : 'bg-blue-600 text-white'
              }`}>
              {message.text}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-blue-400 animate-pulse"></span>
              )}
            </div>
          )}
          
          {/* Widget Area */}
          {renderWidget()}
          
          <span className="text-xs text-gray-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};