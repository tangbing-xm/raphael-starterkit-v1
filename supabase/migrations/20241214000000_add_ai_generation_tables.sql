-- AI Image Generation Tables Migration
-- Created: 2024-12-14
-- Purpose: Add tables to support AI image generation functionality

-- =====================================================
-- Table 1: ai_generations (AI图片生成记录)
-- =====================================================
create table public.ai_generations (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    replicate_prediction_id text,
    generation_type text not null check (generation_type in ('text_to_image', 'image_to_image')),
    prompt text not null,
    input_image_url text,
    output_image_url text,
    output_format text not null check (output_format in ('jpg', 'png', 'webp')),
    aspect_ratio text not null check (aspect_ratio in ('1:1', '16:9', '21:9', '3:2', '4:3', '9:16', '2:3', 'match_input_image')),
    status text not null check (status in ('pending', 'processing', 'succeeded', 'failed')) default 'pending',
    error_message text,
    credits_used integer not null default 1 check (credits_used >= 0),
    generation_time_seconds integer check (generation_time_seconds >= 0),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    completed_at timestamp with time zone
);

-- =====================================================
-- Table 2: user_uploads (用户上传图片记录)
-- =====================================================
create table public.user_uploads (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    filename text not null,
    file_path text not null,
    file_url text not null,
    file_size bigint not null check (file_size > 0),
    mime_type text not null check (mime_type like 'image/%'),
    width integer check (width > 0),
    height integer check (height > 0),
    upload_source text not null check (upload_source in ('web_upload', 'api_upload')) default 'web_upload',
    is_deleted boolean not null default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    deleted_at timestamp with time zone
);

-- =====================================================
-- Table 3: usage_analytics (使用量统计)
-- =====================================================
create table public.usage_analytics (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    date date not null,
    text_to_image_count integer not null default 0 check (text_to_image_count >= 0),
    image_to_image_count integer not null default 0 check (image_to_image_count >= 0),
    total_generations integer not null default 0 check (total_generations >= 0),
    credits_consumed integer not null default 0 check (credits_consumed >= 0),
    successful_generations integer not null default 0 check (successful_generations >= 0),
    failed_generations integer not null default 0 check (failed_generations >= 0),
    avg_generation_time decimal(8,2) check (avg_generation_time >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint usage_analytics_totals_match check (total_generations = text_to_image_count + image_to_image_count),
    constraint usage_analytics_status_match check (total_generations = successful_generations + failed_generations),
    unique(customer_id, date)
);

-- =====================================================
-- Table 4: generation_templates (生成模板)
-- =====================================================
create table public.generation_templates (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references public.customers(id) on delete cascade not null,
    name text not null,
    description text,
    prompt_template text not null,
    output_format text not null check (output_format in ('jpg', 'png', 'webp')) default 'jpg',
    aspect_ratio text not null check (aspect_ratio in ('1:1', '16:9', '21:9', '3:2', '4:3', '9:16', '2:3', 'match_input_image')) default '1:1',
    is_public boolean not null default false,
    usage_count integer not null default 0 check (usage_count >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- 创建索引 (Performance Optimization)
-- =====================================================

-- ai_generations 表索引
create index ai_generations_customer_id_idx on public.ai_generations(customer_id);
create index ai_generations_status_idx on public.ai_generations(status);
create index ai_generations_created_at_idx on public.ai_generations(created_at desc);
create index ai_generations_type_idx on public.ai_generations(generation_type);
create index ai_generations_replicate_id_idx on public.ai_generations(replicate_prediction_id);

-- user_uploads 表索引
create index user_uploads_customer_id_idx on public.user_uploads(customer_id);
create index user_uploads_created_at_idx on public.user_uploads(created_at desc);
create index user_uploads_is_deleted_idx on public.user_uploads(is_deleted);
create index user_uploads_mime_type_idx on public.user_uploads(mime_type);

-- usage_analytics 表索引
create index usage_analytics_customer_date_idx on public.usage_analytics(customer_id, date);
create index usage_analytics_date_idx on public.usage_analytics(date desc);

-- generation_templates 表索引
create index generation_templates_customer_id_idx on public.generation_templates(customer_id);
create index generation_templates_public_idx on public.generation_templates(is_public) where is_public = true;
create index generation_templates_usage_idx on public.generation_templates(usage_count desc);

-- =====================================================
-- 创建 updated_at 触发器
-- =====================================================

-- usage_analytics 表触发器
create trigger handle_usage_analytics_updated_at
    before update on public.usage_analytics
    for each row
    execute function public.handle_updated_at();

-- generation_templates 表触发器
create trigger handle_generation_templates_updated_at
    before update on public.generation_templates
    for each row
    execute function public.handle_updated_at();

-- =====================================================
-- 启用 RLS (Row Level Security)
-- =====================================================

alter table public.ai_generations enable row level security;
alter table public.user_uploads enable row level security;
alter table public.usage_analytics enable row level security;
alter table public.generation_templates enable row level security;

-- =====================================================
-- RLS 策略 - ai_generations 表
-- =====================================================

-- 用户可以查看自己的生成记录
create policy "Users can view their own generations"
    on public.ai_generations for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的生成记录
create policy "Users can insert their own generations"
    on public.ai_generations for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的生成记录
create policy "Users can update their own generations"
    on public.ai_generations for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = ai_generations.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有生成记录
create policy "Service role can manage all generations"
    on public.ai_generations for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - user_uploads 表
-- =====================================================

-- 用户可以查看自己的上传文件
create policy "Users can view their own uploads"
    on public.user_uploads for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的上传文件
create policy "Users can insert their own uploads"
    on public.user_uploads for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的上传文件（主要用于软删除）
create policy "Users can update their own uploads"
    on public.user_uploads for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = user_uploads.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有上传文件
create policy "Service role can manage all uploads"
    on public.user_uploads for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - usage_analytics 表
-- =====================================================

-- 用户可以查看自己的使用统计
create policy "Users can view their own analytics"
    on public.usage_analytics for select
    using (
        exists (
            select 1 from public.customers
            where customers.id = usage_analytics.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有使用统计
create policy "Service role can manage all analytics"
    on public.usage_analytics for all
    using (auth.role() = 'service_role');

-- =====================================================
-- RLS 策略 - generation_templates 表
-- =====================================================

-- 用户可以查看自己的模板和公开模板
create policy "Users can view their own and public templates"
    on public.generation_templates for select
    using (
        is_public = true or
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以插入自己的模板
create policy "Users can insert their own templates"
    on public.generation_templates for insert
    with check (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以更新自己的模板
create policy "Users can update their own templates"
    on public.generation_templates for update
    using (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 用户可以删除自己的模板
create policy "Users can delete their own templates"
    on public.generation_templates for delete
    using (
        exists (
            select 1 from public.customers
            where customers.id = generation_templates.customer_id
            and customers.user_id = auth.uid()
        )
    );

-- 服务角色可以管理所有模板
create policy "Service role can manage all templates"
    on public.generation_templates for all
    using (auth.role() = 'service_role');

-- =====================================================
-- 授予权限给服务角色
-- =====================================================

grant all on public.ai_generations to service_role;
grant all on public.user_uploads to service_role;
grant all on public.usage_analytics to service_role;
grant all on public.generation_templates to service_role;

-- 授予权限给认证用户
grant select, insert, update on public.ai_generations to authenticated;
grant select, insert, update on public.user_uploads to authenticated;
grant select on public.usage_analytics to authenticated;
grant select, insert, update, delete on public.generation_templates to authenticated;

-- =====================================================
-- 创建有用的视图和函数
-- =====================================================

-- 创建用户生成统计视图
create or replace view public.user_generation_stats as
select
    c.user_id,
    c.id as customer_id,
    count(ag.id) as total_generations,
    count(case when ag.status = 'succeeded' then 1 end) as successful_generations,
    count(case when ag.status = 'failed' then 1 end) as failed_generations,
    count(case when ag.generation_type = 'text_to_image' then 1 end) as text_to_image_count,
    count(case when ag.generation_type = 'image_to_image' then 1 end) as image_to_image_count,
    sum(ag.credits_used) as total_credits_used,
    avg(ag.generation_time_seconds) as avg_generation_time,
    max(ag.created_at) as last_generation_at
from public.customers c
left join public.ai_generations ag on c.id = ag.customer_id
group by c.user_id, c.id;

-- 为视图创建RLS策略
alter view public.user_generation_stats enable row level security;

create policy "Users can view their own generation stats"
    on public.user_generation_stats for select
    using (user_id = auth.uid());

-- 授予权限
grant select on public.user_generation_stats to authenticated;
grant all on public.user_generation_stats to service_role;
