import React,{useEffect,useState} from 'react';import {BookOpen,ChevronLeft,ChevronRight} from 'lucide-react';import {api} from '../services/api';
export function State({data,error,children}){return error?<div className="error">{error}</div>:data===null?<p className="muted">Loading…</p>:children}
