const posts = [
  { id: 1, title: '불법 스팸성 글 삭제했습니다. 스팸글 작성하지 마세요', author: '관리', date: '01-23', views: 1836, pinned: true },
  { id: 2, title: 'Lv19 이상 계정 구합니다', author: 'rwrgse', date: '15:37', views: 16 },
  { id: 3, title: '300두 정도되는 계정구합니다', author: '신설계정', date: '01-22', views: 17 },
  { id: 4, title: '신규 기존 계정 삽니다', author: 'ㅇㄴㄹㅇㄹㅋ', date: '01-22', views: 15 },
  { id: 5, title: '계정 삽니다', author: '한게임파망', date: '01-21', views: 16 },
  { id: 6, title: '고투 5t 주유용 계정 삽니다. 여건있고 가속좀있으면 답봐요', author: '11', date: '01-19', views: 31 },
  { id: 7, title: '자원싸게팝니다', author: '잉', date: '01-18', views: 24 },
  { id: 8, title: '계정팝니다', author: 'ㅇㅇ', date: '01-17', views: 91 },
  { id: 9, title: '25홀 2500두 미만 농장 계정 팝니다', author: '라오킹', date: '01-14', views: 67 },
  { id: 10, title: '자원상 합니다', author: 'ㅇ', date: '01-11', views: 45 },
  { id: 11, title: '서버사요', author: '서버', date: '01-09', views: 47 },
]

function Community() {
  return (
    <section className="community">
      <div className="community-toolbar">
        <div className="community-title">
          <h1>커뮤니티</h1>
          <p>비회원도 글 작성이 가능합니다.</p>
        </div>
        <div className="community-actions">
          <button className="community-icon-button" type="button" aria-label="글쓰기">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 17.25V21h3.75L18.37 9.38l-3.75-3.75L3 17.25z" />
              <path d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
          <button className="community-icon-button community-icon-button--search" type="button" aria-label="검색">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M10 4a6 6 0 1 0 3.74 10.7l4.53 4.53 1.41-1.41-4.53-4.53A6 6 0 0 0 10 4zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="community-table">
        <div className="community-header">
          <span className="col-title">제목</span>
          <span className="col-author">작성자</span>
          <span className="col-date">작성일</span>
          <span className="col-views">조회</span>
        </div>
        <div className="community-body">
          {posts.map((post) => (
            <div key={post.id} className={`community-row${post.pinned ? ' is-pinned' : ''}`}>
              <div className="col-title">
                <span className="post-icon">💬</span>
                <span className="post-title">{post.title}</span>
                {post.pinned ? <span className="post-badge">공지</span> : null}
              </div>
              <span className="col-author">{post.author}</span>
              <span className="col-date">{post.date}</span>
              <span className="col-views">{post.views}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Community
