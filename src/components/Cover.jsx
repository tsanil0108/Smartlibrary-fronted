import React,{useEffect,useState} from 'react';import {BookOpen,ChevronLeft,ChevronRight} from 'lucide-react';import {api} from '../services/api';
export function Cover({book}){const [bad,setBad]=useState(false);return book.coverUrl&&!bad?<img className="cover" src={book.coverUrl} onError={()=>setBad(true)} alt={book.title}/>:<div className="cover placeholder"><span>{book.title}</span></div>}
