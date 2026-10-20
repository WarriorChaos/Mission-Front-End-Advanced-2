import './CourseCard.css';

export default function CourseCard({
  image,
  title,
  description,
  instructor,
  instructorRole,
  rating,
  reviews,
  price
}) {
  return (
    <div className="course-card">
      <div className="course-image">
        <img src={image} alt={title} />
      </div>
      <div className="course-content">
        <h3 className="course-title">{title}</h3>
        <p className="course-description">{description}</p>
        
        <div className="course-instructor">
          <img 
            src={instructor.avatar} 
            alt={instructor.name}
            className="instructor-avatar"
          />
          <div className="instructor-info">
            <p className="instructor-name">{instructor.name}</p>
            <p className="instructor-role">{instructorRole}</p>
          </div>
        </div>

        <div className="course-footer">
          <div className="course-rating">
            <div className="stars">
              {[...Array(Math.floor(rating))].map((_, i) => (
                <span key={i} className="star filled">★</span>
              ))}
              {rating % 1 !== 0 && <span className="star half">★</span>}
              {[...Array(5 - Math.ceil(rating))].map((_, i) => (
                <span key={i + Math.ceil(rating)} className="star empty">★</span>
              ))}
            </div>
            <span className="review-count">({reviews})</span>
          </div>
          <span className="course-price">{price}</span>
        </div>
      </div>
    </div>
  );
}
