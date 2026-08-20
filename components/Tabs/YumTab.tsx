'use client';

import React from 'react';

export interface YumItem {
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

export interface YumComment {
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
  familyMembers
}) => {
  return (
    <div>
      {/* CATEGORY & LOCATION FILTERS & SORT */}
      <div style={{ background: 'rgba(18, 18, 26, 0.85)', padding: '12px', borderRadius: '18px', border: '1px solid #2A2A3C', marginBottom: '12px', backdropFilter: 'blur(8px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '10px' }}>
          <button
            onClick={() => toggleYumCategoryFilter('food')}
            style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'food' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'food' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
          >
            🍔 Food
          </button>
          <button
            onClick={() => toggleYumCategoryFilter('drink')}
            style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'drink' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'drink' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
          >
            🍹 Drink
          </button>
          <button
            onClick={() => toggleYumCategoryFilter('dessert')}
            style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'dessert' ? '2px solid #F59E0B' : '1px solid #2A2A3C', background: yumCategoryFilter === 'dessert' ? '#F59E0B' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
          >
            🍰 Dessert
          </button>
          <button
            onClick={() => toggleYumCategoryFilter('gf')}
            style={{ padding: '8px 2px', borderRadius: '8px', border: yumCategoryFilter === 'gf' ? '2px solid #22C55E' : '1px solid #2A2A3C', background: yumCategoryFilter === 'gf' ? '#22C55E' : '#1A1A26', color: '#FFF', fontSize: '11px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' }}
          >
            🌾 GF
          </button>
        </div>

        {/* LOCATION FILTER & SORT DROPDOWNS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <select
            value={selectedYumLocation}
            onChange={(e) => setSelectedYumLocation(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: '700' }}
          >
            <option value="All Locations">All Locations</option>
            {yumLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={yumSortBy}
            onChange={(e: any) => setYumSortBy(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px', fontWeight: '700' }}
          >
            <option value="default">Sort: Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Item Name (A-Z)</option>
            <option value="location-asc">Location (A-Z)</option>
          </select>
        </div>
      </div>

      {/* YUM ITEM CARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredYumItems.length === 0 ? (
          <p style={{ color: '#A0AEC0', textAlign: 'center', fontSize: '13px', fontStyle: 'italic', margin: '20px 0' }}>No menu items found for this filter.</p>
        ) : (
          filteredYumItems.map(item => {
            const comments = yumCommentsMap[item.id] || [];
            const isCommentsOpen = openCommentsItemId === item.id;
            const hasComments = comments.length > 0;

            return (
              <div
                key={item.id}
                style={{
                  background: 'rgba(18, 18, 26, 0.85)',
                  borderRadius: '20px',
                  padding: '16px',
                  border: item.isGlutenFree ? '2px solid #22C55E' : '1px solid #2A2A3C',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    onClick={() => setPreviewYumImage(item.image)}
                    onError={(e: any) => { e.target.src = '/hhn-bg.jpg'; }}
                    style={{ width: '80px', height: '80px', borderRadius: '14px', objectFit: 'cover', border: '1px solid #2A2A3C', flexShrink: 0, cursor: 'pointer' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: '#FFF' }}>{item.name}</h3>

                    <div
                      onClick={() => setSelectedYumLocation(item.location)}
                      style={{ fontSize: '11px', fontWeight: '800', color: '#F59E0B', marginTop: '2px', cursor: 'pointer', display: 'inline-block' }}
                    >
                      {item.location}
                    </div>

                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#22C55E', marginTop: '4px' }}>
                      {item.price}
                    </div>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#CBD5E0', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #2A2A3C', paddingTop: '10px' }}>
                  <div>
                    {item.isGlutenFree && (
                      <span style={{ background: '#15803D', color: '#FFF', fontSize: '10px', fontWeight: '900', padding: '3px 8px', borderRadius: '6px' }}>
                        🌾 GLUTEN-FREE
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => setOpenCommentsDrawerItemId(isCommentsOpen ? null : item.id)}
                    style={{ background: '#1A1A26', border: '1px solid #2A2A3C', color: '#CBD5E0', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                  >
                    Comments <span style={{ color: hasComments ? '#F59E0B' : '#A0AEC0', fontWeight: '900' }}>({comments.length})</span>
                  </button>
                </div>

                {/* INLINE COMMENTS DRAWER */}
                {isCommentsOpen && (
                  <div style={{ marginTop: '12px', background: '#12121A', padding: '12px', borderRadius: '14px', border: '1px solid #2A2A3C' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#A0AEC0', marginBottom: '8px' }}>
                      COMMENTS ({comments.length}):
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
                      {comments.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#718096', fontStyle: 'italic' }}>No comments yet. Be the first!</div>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} style={{ background: '#1A1A26', padding: '6px 8px', borderRadius: '8px', border: '1px solid #2A2A3C', fontSize: '12px' }}>
                            <strong style={{ color: '#FF5500' }}>{c.author_name}:</strong> <span style={{ color: '#CBD5E0' }}>{c.comment_text}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* ADD COMMENT FORM */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <select
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '12px' }}
                      >
                        {familyMembers.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input
                          type="text"
                          placeholder="Leave a comment"
                          value={commentTextInput}
                          onChange={(e) => setCommentTextInput(e.target.value)}
                          style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #2A2A3C', background: '#1A1A26', color: '#FFF', fontSize: '16px' }}
                        />
                        <button
                          type="button"
                          onClick={() => onAddComment(item.id)}
                          disabled={submittingComment}
                          style={{ padding: '8px 12px', background: '#22C55E', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
