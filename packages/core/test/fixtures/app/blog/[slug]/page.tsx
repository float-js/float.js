export default function BlogPost({ params }: { params: { slug: string } }) {
  return <article>Post: {params.slug}</article>;
}
