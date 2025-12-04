import React from 'react';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: Date;
  // New fields for rich interactions
  type?: 'text' | 'widget';
  widgetType?: 'data-binding' | 'material-selection' | 'image-upload' | 'style-selection' | 'copy-selection' | 'product-form' | 'simple-options' | 'upload-trigger' | 'marketing-plan' | 'optimization-decision' | 'campaign-report' | 'diagnosis-alert' | 'diagnosis-card' | 'smart-report';
  widgetData?: any; // Flexible data for specific widgets
}

export enum NavItem {
  AGENT = 'agent',
  PRODUCTS = 'products',
  ASSETS = 'assets', // 素材生成
  MARKETING = 'marketing',
  DIAGNOSIS = 'diagnosis',
  SETTINGS = 'settings' // implied 6th item or general setting
}

export interface NavConfig {
  id: NavItem;
  label: string;
  icon: React.ComponentType<any>;
}