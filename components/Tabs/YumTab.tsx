'use client';

import React from 'react';

interface YumItem {
  id: string;
  name: string;
  description: string;
  location: string;
  price: string;
  rawPrice: number;
  image: string;
  isFood: boolean;
  isDrink: boolean;
  isDessert: boolean;
  isGlutenFree: boolean;
}

interface YumComment {
  id: string;
  item_id: string;
  author_name: string;
  comment_text: string;
  created_at?: string;
}

interface YumTabProps {
  yumCategoryFilter: 'all' | 'food' | 'drink' | 'dessert' | 'gf';
  toggleYumCategoryFilter: (cat: 'food' | 'drink' | 'dessert' | 'gf') => void;
  selectedYumLocation: string;
  setSelectedYumLocation: (loc: string) => void;
  yumSortBy: 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'location-asc';
  setYumSortBy: (sort: 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'location-asc') => void;
  filteredYumItems: YumItem[];
  yumLocations: string[];
  yumCommentsMap: Record<string, YumComment[]>;
  openCommentsItemId: string | null;
  setOpenCommentsDrawerItemId: (id: string | null) => void;
  commentAuthor: string;
  setCommentAuthor: (author: string) => void;
  commentTextInput: string;
  setCommentTextInput: (text: string) => void;
  submittingComment: boolean;
  onAddComment: (itemId: string) => void;
  setPreviewYumImage: (img: string | null) => void;
  familyMembers: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const YumTab: React.FC<YumTabProps> = ({
  yumCategoryFilter,
  toggleYumCategoryFilter,
  selectedYumLocation,
  setSelectedYumLocation,
  yumSortBy,
  setYumSortBy,
  filteredYumItems,
  yumLocations,
  yumCommentsMap,
  openCommentsItemId,
  setOpenCommentsDrawerItemId,
  commentAuthor,
  setCommentAuthor,
  commentTextInput,
  setCommentTextInput,
  submittingComment,
  onAddComment,
  setPreviewYumImage,
  familyMembers,
  searchQuery,
  setSearchQuery
}) => {
  return (
    <div>
      {/* FILTER & SEARCH CARD */}
      <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '14px', borderRadius: '20px', border: '1px solid #2A2A3C', marginBottom: '16px', backdropFilter: 'blur(8px)' }}>
        
        {/* 🔍 SEARCH BAR */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="🔍 Search food, drinks, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 12px',
              borderRadius: '12px',
              border: searchQuery ? '1px solid #F59E0B' : '1px solid #2A2A3C',
              background: '#1A1A26',
              color: '#FFF',
              fontSize: '13px',
              fontWeight: '600',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#A0AEC0',
                fontSize: '14px',
                fontWeight: '800',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* ACTIVE LOCATION CLEAR BADGE */}
        {selectedYumLocation !== 'All Locations' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2D2008', border: '1px solid #F59E0B', padding: '6px 10px', borderRadius: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B' }}>
              📍 Filtered by: <strong>{selectedYumLocation}</strong>
            </span>
            <button
              onClick={() => setSelectedYumLocation('All Locations')}
              style={{ background: '#F59E0B', color: '#000', border: 'none', borderRadius: '6px', fontSize: '10px', fontWeight: '900', padding: '3px 8px', cursor: 'pointer' }}
            >
              Show All Locations ✕
            </button>
          </div>
        )}

        {/* LOCATION & SORT DROPDOWNS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>LOCATION</label>
            <select
              value={selectedYumLocation}
              onChange={(e) => setSelectedYumLocation(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}
            >
              <option value="All Locations">All Locations</option>
              {yumLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', fontWeight: '800', color: '#A0AEC0', display: 'block', marginBottom: '4px' }}>SORT BY</label>
            <select
              value={yumSortBy}
              onChange={(e: any) => setYumSortBy(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}
            >
              <option value="default">Default (ID)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="location-asc">Location: A to Z</option>
            </select>
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {[
            { key: 'food', label: '🍔 Food' },
            { key: 'drink', label: '🍸 Drink' },
            { key: 'dessert', label: '🍰 Dessert' },
            { key: 'gf', label: '🌾 GF' }
          ].map(cat => {
            const isActive = yumCategoryFilter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => toggleYumCategoryFilter(cat.key as any)}
                style={{
                  padding: '7px 2px',
                  borderRadius: '10px',
                  border: isActive ? '2px solid #F59E0B' : '1px solid #2A2A3C',
                  background: isActive ? '#F59E0B' : '#1A1A26',
                  color: isActive ? '#000' : '#CBD5E0',
                  fontSize: '11px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* YUM ITEMS LIST */}
      {filteredYumItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 10px', color: '#A0AEC0', fontStyle: 'italic' }}>
          No food or drinks match your filter.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {filteredYumItems.map(item => {
            const comments = yumCommentsMap[item.id] || [];
            const isCommentsOpen = openCommentsItemId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(18, 18, 26, 0.85)',
                  borderRadius: '20px',
                  padding: '16px',
                  border: '1px solid #2A2A3C',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
              >
                {/* ITEM HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFF' }}>{item.name}</div>
                    
                    {/* CLICKABLE LOCATION FILTER */}
                    <button
                      onClick={() => setSelectedYumLocation(item.location)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#F59E0B',
                        marginTop: '2px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      📍 {item.location}
                    </button>
                  </div>

                  <div style={{ background: '#2D2008', color: '#F59E0B', border: '1px solid #F59E0B', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: '900', flexShrink: 0 }}>
                    {item.price}
                  </div>
                </div>

                {/* DESCRIPTION */}
                <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#A0AEC0', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                {/* TAGS & REVIEWS TOGGLE */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2A3C', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {item.isFood && <span style={{ background: '#1A1A26', color: '#CBD5E0', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', border: '1px solid #2A2A3C' }}>Food</span>}
                    {item.isDrink && <span style={{ background: '#1A1A26', color: '#60A5FA', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', border: '1px solid #2A2A3C' }}>Drink</span>}
                    {item.isDessert && <span style={{ background: '#1A1A26', color: '#EC4899', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', border: '1px solid #2A2A3C' }}>Dessert</span>}
                    {item.isGlutenFree && <span style={{ background: '#1A1A26', color: '#10B981', fontSize: '10px', padding: '2px 6px', borderRadius: '6px', border: '1px solid #2A2A3C' }}>GF</span>}
                  </div>

                  <button
                    onClick={() => setOpenCommentsDrawerItemId(isCommentsOpen ? null : item.id)}
                    style={{ background: 'none', border: 'none', color: '#F59E0B', fontSize: '12px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                  >
                    💬 Reviews ({comments.length}) {isCommentsOpen ? '▲' : '▼'}
                  </button>
                </div>

                {/* REVIEWS DRAWER */}
                {isCommentsOpen && (
                  <div style={{ marginTop: '12px', background: '#12121A', padding: '12px', borderRadius: '14px', border: '1px solid #2A2A3C' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {comments.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>No reviews yet. Be the first to leave one!</div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} style={{ background: '#1A1A26', padding: '8px 10px', borderRadius: '8px', border: '1px solid #2A2A3C' }}>
                            <div style={{ fontSize: '10px', fontWeight: '800', color: '#F59E0B', marginBottom: '2px' }}>{c.author_name}</div>
                            <div style={{ fontSize: '12px', color: '#FFF' }}>{c.comment_text}</div>
                          </div>
                        ))
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        style={{ padding: '6px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: 'bold' }}
                      >
                        {familyMembers.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <input
                        type="text"
                        placeholder="Add a review..."
                        value={commentTextInput}
                        onChange={(e) => setCommentTextInput(e.target.value)}
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px' }}
                      />
                      <button
                        onClick={() => onAddComment(item.id)}
                        disabled={submittingComment}
                        style={{ padding: '6px 12px', background: '#F59E0B', color: '#000', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '11px', cursor: 'pointer' }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
